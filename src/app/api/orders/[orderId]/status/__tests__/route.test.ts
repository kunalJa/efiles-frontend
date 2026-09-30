import { getDocumentClient } from "@/lib/server/aws";
import { GET } from "../route";

jest.mock("@/lib/server/aws", () => ({ getDocumentClient: jest.fn() }));

const sendQuery = jest.fn();
const orderId = "0123456789abcdef0123456789abcdef";

beforeEach(() => {
  process.env.AWS_DYNAMO_DB_NAME = "kz-pdf-files-db";
  process.env.AWS_ORDER_ID_INDEX_NAME = "OrderID-index";
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
    ProjectionExpression: "OrderID, #status, UpdatedAt, PrintfulStatus, ShirtSize, S3Key",
    Limit: 1,
  });
});

test("returns sanitized lifecycle fields without revealing the assigned file", async () => {
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

test("rejects an invalid order ID without querying DynamoDB", async () => {
  const response = await GET(new Request("http://localhost"), {
    params: { orderId: "not/valid" },
  });

  expect(response.status).toBe(400);
  expect(sendQuery).not.toHaveBeenCalled();
});
