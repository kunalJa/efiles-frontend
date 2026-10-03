import { NextResponse } from "next/server";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { isOrderStatus, isShirtSize } from "@/lib/constants";
import { getDocumentClient } from "@/lib/server/aws";

export const runtime = "nodejs";

const ORDER_ID_PATTERN = /^[A-Za-z0-9_-]{1,32}$/;
const SOURCE_KEY_PATTERN = /^VOL(\d{5})\/EFTA\d{8}\.pdf$/;

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

function safeTrackingUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length > 2048) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && url.hostname && !url.username && !url.password) return url.href;
  } catch {
    return undefined;
  }
  return undefined;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { orderId } = await params;

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
          "OrderID, #status, UpdatedAt, PrintfulStatus, PrintfulOrderID, ShirtSize, S3Key",
        ExpressionAttributeNames: { "#status": "Status" },
      }),
    );
    const items = result.Items || [];
    const item = items.find((item) => item.Status === "SOLD" || item.Status === "DRAFT_ONLY")
      || items.find((item) => item.Status === "FAILED" || item.Status === "REFUNDED_FAILED")
      || items[0];

    if (!item) {
      return NextResponse.json({ orderId, status: "PENDING" }, { status: 202 });
    }

    const status = isOrderStatus(item.Status) ? item.Status : "PENDING";
    const response: Record<string, unknown> = { orderId, status };

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
    const token = process.env.PRINTFUL_STATUS_TOKEN;
    if (status === "SOLD" && Number.isSafeInteger(item.PrintfulOrderID) && item.PrintfulOrderID > 0 && token) {
      try {
        const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
        const storeId = process.env.PRINTFUL_STORE_ID;
        if (storeId && !/^[0-9]+$/.test(storeId)) throw new Error("PRINTFUL_STORE_ID must be numeric, not the store name");
        if (storeId) headers["X-PF-Store-Id"] = storeId;
        const printfulResponse = await fetch(`https://api.printful.com/orders/${item.PrintfulOrderID}`, {
          headers,
          cache: "no-store",
          signal: AbortSignal.timeout(5000),
        });
        if (!printfulResponse.ok) throw new Error(`Printful returned ${printfulResponse.status}`);
        const payload = await printfulResponse.json();
        if (payload.code !== 200 || payload.result?.external_id !== orderId) {
          throw new Error("Printful order did not match the requested order");
        }
        const fulfillment = payload.result;
        if (typeof fulfillment.status === "string" && /^[a-z_]{1,32}$/.test(fulfillment.status)) {
          response.fulfillmentStatus = fulfillment.status;
        }
        if (Array.isArray(fulfillment.shipments)) {
          response.shipments = fulfillment.shipments.slice(0, 10).flatMap((shipment: unknown) => {
            if (!shipment || typeof shipment !== "object") return [];
            const data = shipment as Record<string, unknown>;
            const details: Record<string, string> = {};
            if (typeof data.carrier === "string" && data.carrier.length <= 128) details.carrier = data.carrier;
            if (typeof data.tracking_number === "string" && data.tracking_number.length <= 128) details.trackingNumber = data.tracking_number;
            const trackingUrl = safeTrackingUrl(data.tracking_url);
            if (trackingUrl) details.trackingUrl = trackingUrl;
            return Object.keys(details).length ? [details] : [];
          });
        }
      } catch (error) {
        console.error("Unable to retrieve live fulfillment status", error);
      }
    }
    return NextResponse.json(response, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Unable to query order status", error);
    return NextResponse.json(
      { error: "Unable to retrieve order status" },
      { status: 500 },
    );
  }
}
