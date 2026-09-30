import { NextResponse } from "next/server";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { isOrderStatus, isShirtSize } from "@/lib/constants";
import { getDocumentClient } from "@/lib/server/aws";

export const runtime = "nodejs";

const ORDER_ID_PATTERN = /^[A-Za-z0-9_-]{1,32}$/;
const SOURCE_KEY_PATTERN = /^VOL(\d{5})\/EFTA\d{8}\.pdf$/;

type RouteContext = {
  params: { orderId: string };
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { orderId } = params;

  if (!ORDER_ID_PATTERN.test(orderId)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  const tableName = process.env.AWS_DYNAMO_DB_NAME;
  const indexName = process.env.AWS_ORDER_ID_INDEX_NAME;

  if (!tableName || !indexName) {
    return NextResponse.json(
      { error: "Order status is not configured" },
      { status: 500 },
    );
  }

  try {
    const result = await getDocumentClient().send(
      new QueryCommand({
        TableName: tableName,
        IndexName: indexName,
        KeyConditionExpression: "OrderID = :orderId",
        ExpressionAttributeValues: { ":orderId": orderId },
        ProjectionExpression:
          "OrderID, #status, UpdatedAt, PrintfulStatus, ShirtSize, S3Key",
        ExpressionAttributeNames: { "#status": "Status" },
        Limit: 1,
      }),
    );
    const item = result.Items?.[0];

    if (!item) {
      return NextResponse.json({ orderId, status: "PENDING" }, { status: 202 });
    }

    const status = isOrderStatus(item.Status) ? item.Status : "PENDING";
    const response: Record<string, string | number> = { orderId, status };

    if ((status === "SOLD" || status === "DRAFT_ONLY") && typeof item.S3Key === "string") {
      const match = SOURCE_KEY_PATTERN.exec(item.S3Key);
      if (match) {
        const volume = Number(match[1]);
        if (volume >= 1 && volume <= 12) response.volume = volume;
      }
    }
    if (typeof item.UpdatedAt === "string") {
      response.updatedAt = item.UpdatedAt;
    }
    if (isShirtSize(item.ShirtSize)) {
      response.shirtSize = item.ShirtSize;
    }
    if (typeof item.PrintfulStatus === "string") {
      response.fulfillmentStatus = item.PrintfulStatus;
    }
    return NextResponse.json(response);
  } catch (error) {
    console.error("Unable to query order status", error);
    return NextResponse.json(
      { error: "Unable to retrieve order status" },
      { status: 500 },
    );
  }
}
