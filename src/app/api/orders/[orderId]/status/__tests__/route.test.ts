import { getDocumentClient } from "@/lib/server/aws";
import { GET } from "../route";

jest.mock("@/lib/server/aws", () => ({ getDocumentClient: jest.fn() }));

const sendQuery = jest.fn();
const printfulFetch = jest.fn();
const orderId = "0123456789abcdef0123456789abcdef";

beforeEach(() => {
  process.env.AWS_DYNAMO_DB_NAME = "kz-pdf-files-db";
  process.env.AWS_ORDER_ID_INDEX_NAME = "OrderID-index";
  process.env.PRINTFUL_STATUS_TOKEN = "test-token";
  delete process.env.PRINTFUL_STORE_ID;
  sendQuery.mockReset();
  printfulFetch.mockReset();
  global.fetch = printfulFetch;
  jest.mocked(getDocumentClient).mockReturnValue({
    send: sendQuery,
  } as unknown as ReturnType<typeof getDocumentClient>);
});

test("reports missing order-status configuration without querying DynamoDB", async () => {
  delete process.env.AWS_ORDER_ID_INDEX_NAME;

  const response = await GET(new Request("http://localhost"), { params: { orderId } });

  expect(response.status).toBe(500);
  expect(await response.json()).toEqual({ error: "Order status is not configured" });
  expect(getDocumentClient).not.toHaveBeenCalled();
});

test("returns pending with 202 before Lambda claims an inventory row", async () => {
  sendQuery.mockResolvedValue({ Items: [] });

  const response = await GET(new Request("http://localhost"), {
    params: { orderId },
  });

  expect(response.status).toBe(202);
  expect(await response.json()).toEqual({ orderId, status: "PENDING" });
  expect(sendQuery).toHaveBeenCalledTimes(1);
  expect(sendQuery.mock.calls[0][0].input).toMatchObject({
    TableName: "kz-pdf-files-db",
    IndexName: "OrderID-index",
    KeyConditionExpression: "OrderID = :orderId",
    ExpressionAttributeValues: { ":orderId": orderId },
    ProjectionExpression: "OrderID, #status, UpdatedAt, PrintfulStatus, PrintfulOrderID, ShirtSize, S3Key",
  });
});

test("returns sanitized lifecycle fields without revealing the assigned file", async () => {
  delete process.env.PRINTFUL_STATUS_TOKEN;
  sendQuery.mockResolvedValue({
    Items: [
      {
        OrderID: orderId,
        Status: "SOLD",
        UpdatedAt: "2026-08-27T12:00:00Z",
        FileID: "EFTA00505541",
        ShirtSize: "XL",
        PrintfulStatus: "pending",
        PaymentIntentID: "pi_secret",
        S3Key: "VOL00009/EFTA00505541.pdf",
        PrintfulOrderID: 12345,
        ErrorMessage: "provider internals",
      },
    ],
  });

  const response = await GET(new Request("http://localhost"), {
    params: { orderId },
  });

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    orderId,
    status: "SOLD",
    updatedAt: "2026-08-27T12:00:00Z",
    shirtSize: "XL",
    fulfillmentStatus: "pending",
    volume: 9,
  });
});

test("uses the completed row instead of a duplicate unfinished inventory claim", async () => {
  delete process.env.PRINTFUL_STATUS_TOKEN;
  sendQuery.mockResolvedValue({ Items: [
    { OrderID: orderId, Status: "PROCESSING", S3Key: "VOL00001/EFTA00000001.pdf" },
    { OrderID: orderId, Status: "SOLD", ShirtSize: "M", PrintfulStatus: "pending", S3Key: "VOL00009/EFTA00505541.pdf" },
  ] });

  const response = await GET(new Request("http://localhost"), { params: { orderId } });

  expect(await response.json()).toEqual({ orderId, status: "SOLD", shirtSize: "M", fulfillmentStatus: "pending", volume: 9 });
  expect(sendQuery.mock.calls[0][0].input.Limit).toBeUndefined();
});

test("reveals only a volume for a completed draft order", async () => {
  sendQuery.mockResolvedValue({
    Items: [{ Status: "DRAFT_ONLY", S3Key: "VOL00010/EFTA00420940.pdf", FileID: "EFTA00420940" }],
  });

  const response = await GET(new Request("http://localhost"), { params: { orderId } });

  expect(await response.json()).toEqual({ orderId, status: "DRAFT_ONLY", volume: 10 });
});

test("omits a volume when the stored source key is unexpected", async () => {
  for (const S3Key of [
    "VOL00009/other/EFTA00505541.pdf",
    "VOL00000/EFTA00505541.pdf",
    "VOL99999/EFTA00505541.pdf",
  ]) {
    sendQuery.mockResolvedValue({ Items: [{ Status: "SOLD", S3Key }] });

    const response = await GET(new Request("http://localhost"), { params: { orderId } });

    expect(await response.json()).toEqual({ orderId, status: "SOLD" });
  }
});

test("does not expose a file ID or volume before completion or on failure", async () => {
  for (const status of ["PROCESSING", "FAILED", "REFUNDED_FAILED"]) {
    sendQuery.mockResolvedValue({
      Items: [{ Status: status, FileID: "EFTA00505541", S3Key: "VOL00009/EFTA00505541.pdf" }],
    });

    const response = await GET(new Request("http://localhost"), { params: { orderId } });

    expect(await response.json()).toEqual({ orderId, status });
  }
});

test("fetches live Printful shipments server-side without exposing private fields", async () => {
  process.env.PRINTFUL_STORE_ID = "77";
  sendQuery.mockResolvedValue({ Items: [{ Status: "SOLD", PrintfulOrderID: 12345 }] });
  printfulFetch.mockResolvedValue({ ok: true, json: async () => ({ code: 200, result: {
    external_id: orderId, status: "fulfilled",
    shipments: [{ carrier: "USPS", tracking_number: "123", tracking_url: "https://tracking.example/123", items: ["private"] },
      { tracking_url: "javascript:alert(1)" }],
    recipient: { email: "private@example.com" },
  } }) });

  const response = await GET(new Request("http://localhost"), { params: { orderId } });

  expect(await response.json()).toEqual({ orderId, status: "SOLD", fulfillmentStatus: "fulfilled",
    shipments: [{ carrier: "USPS", trackingNumber: "123", trackingUrl: "https://tracking.example/123" }] });
  expect(printfulFetch).toHaveBeenCalledWith("https://api.printful.com/orders/12345", expect.objectContaining({
    headers: expect.objectContaining({ Authorization: "Bearer test-token", "X-PF-Store-Id": "77" }),
    cache: "no-store",
  }));
  expect(response.headers.get("Cache-Control")).toBe("private, no-store");
});

test("falls back to stored status when Printful is unavailable or the order does not match", async () => {
  sendQuery.mockResolvedValue({ Items: [{ Status: "SOLD", PrintfulOrderID: 12345, PrintfulStatus: "pending" }] });
  const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

  try {
    printfulFetch.mockRejectedValueOnce(new Error("Printful unavailable"));
    const unavailable = await GET(new Request("http://localhost"), { params: { orderId } });
    expect(await unavailable.json()).toEqual({ orderId, status: "SOLD", fulfillmentStatus: "pending" });
    printfulFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ code: 200, result: {
      external_id: "someone-else", status: "fulfilled", shipments: [{ tracking_url: "https://tracking.example/private" }],
    } }) });
    const mismatched = await GET(new Request("http://localhost"), { params: { orderId } });
    expect(await mismatched.json()).toEqual({ orderId, status: "SOLD", fulfillmentStatus: "pending" });
  } finally {
    consoleError.mockRestore();
  }
});

test("does not send a Printful store display name as the store ID", async () => {
  process.env.PRINTFUL_STORE_ID = "mysteryfile";
  sendQuery.mockResolvedValue({ Items: [{ Status: "SOLD", PrintfulOrderID: 12345, PrintfulStatus: "pending" }] });
  const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

  try {
    const response = await GET(new Request("http://localhost"), { params: { orderId } });
    expect(await response.json()).toEqual({ orderId, status: "SOLD", fulfillmentStatus: "pending" });
    expect(printfulFetch).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith("Unable to retrieve live fulfillment status", expect.objectContaining({
      message: "PRINTFUL_STORE_ID must be numeric, not the store name",
    }));
  } finally {
    consoleError.mockRestore();
  }
});

test("does not call Printful for an unfinished order", async () => {
  sendQuery.mockResolvedValue({ Items: [{ Status: "PROCESSING", PrintfulOrderID: 12345 }] });
  await GET(new Request("http://localhost"), { params: { orderId } });
  expect(printfulFetch).not.toHaveBeenCalled();
});

test("rejects an invalid order ID without querying DynamoDB", async () => {
  const response = await GET(new Request("http://localhost"), {
    params: { orderId: "not/valid" },
  });

  expect(response.status).toBe(400);
  expect(sendQuery).not.toHaveBeenCalled();
});
