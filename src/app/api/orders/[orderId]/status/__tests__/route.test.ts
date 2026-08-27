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
    Limit: 1,
  });
});

test("returns only sanitized lifecycle fields and a terminal file ID", async () => {
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
        S3Key: "private/key.pdf",
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
    fileId: "EFTA00505541",
  });
});

test("does not expose a file ID while processing", async () => {
  sendQuery.mockResolvedValue({
    Items: [{ Status: "PROCESSING", FileID: "EFTA00505541" }],
  });

  const response = await GET(new Request("http://localhost"), {
    params: { orderId },
  });

  expect(await response.json()).toEqual({ orderId, status: "PROCESSING" });
});

test("rejects an invalid order ID without querying DynamoDB", async () => {
  const response = await GET(new Request("http://localhost"), {
    params: { orderId: "not/valid" },
  });

  expect(response.status).toBe(400);
  expect(sendQuery).not.toHaveBeenCalled();
});
