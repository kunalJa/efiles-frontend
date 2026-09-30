import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import {
  CURRENCY,
  PRICING_VERSION,
  PRODUCT_AMOUNT_CENTS,
  QUANTITY,
  SHIPPING_AMOUNT_CENTS,
  SHIPPING_METHOD,
  TAX_AMOUNT_CENTS,
  isShirtSize,
} from "@/lib/constants";
import { getStripe } from "@/lib/server/stripe";

export const runtime = "nodejs";

function isSizeOnlyRequest(value: unknown): value is { size: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.keys(value).length === 1 &&
    "size" in value &&
    typeof value.size === "string"
  );
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isSizeOnlyRequest(body) || !isShirtSize(body.size)) {
    return NextResponse.json(
      { error: "Size must be one of S, M, L, or XL" },
      { status: 400 },
    );
  }

  const appUrl = process.env.APP_URL?.replace(/\/$/, "");

  if (!appUrl) {
    return NextResponse.json(
      { error: "Checkout is not configured" },
      { status: 500 },
    );
  }

  const orderId = randomBytes(16).toString("hex");
  const checkoutAttemptId = randomBytes(16).toString("hex");
  const { size } = body;

  try {
    const session = await getStripe().checkout.sessions.create(
      {
        mode: "payment",
        client_reference_id: orderId,
        line_items: [
          {
            price_data: {
              currency: CURRENCY,
              unit_amount: PRODUCT_AMOUNT_CENTS,
              product_data: {
                name: "E-Files Mystery Document T-Shirt",
                description: `White Gildan 5000 — Size ${size}`,
              },
            },
            quantity: QUANTITY,
          },
        ],
        shipping_address_collection: { allowed_countries: ["US"] },
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              fixed_amount: {
                amount: SHIPPING_AMOUNT_CENTS,
                currency: CURRENCY,
              },
              display_name: "Standard US shipping",
              delivery_estimate: {
                minimum: { unit: "business_day", value: 6 },
                maximum: { unit: "business_day", value: 10 },
              },
            },
          },
        ],
        phone_number_collection: { enabled: true },
        automatic_tax: { enabled: false },
        metadata: {
          order_id: orderId,
          size,
          quantity: String(QUANTITY),
        },
        payment_intent_data: {
          capture_method: "manual",
          metadata: {
            order_id: orderId,
            size,
            quantity: String(QUANTITY),
            product_amount_cents: String(PRODUCT_AMOUNT_CENTS),
            shipping_amount_cents: String(SHIPPING_AMOUNT_CENTS),
            tax_amount_cents: String(TAX_AMOUNT_CENTS),
            shipping_method: SHIPPING_METHOD,
            pricing_version: PRICING_VERSION,
          },
        },
        success_url: `${appUrl}/orders/${orderId}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/?canceled=1&size=${size}`,
      },
      { idempotencyKey: checkoutAttemptId },
    );

    if (!session.url) {
      throw new Error("Stripe did not return a Checkout URL");
    }

    return NextResponse.json({ orderId, checkoutUrl: session.url });
  } catch (error) {
    console.error("Unable to create Stripe Checkout Session", error);
    return NextResponse.json(
      { error: "Unable to start checkout" },
      { status: 500 },
    );
  }
}
