import { InvokeCommand } from "@aws-sdk/client-lambda";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  CURRENCY,
  PRICING_VERSION,
  PRODUCT_AMOUNT_CENTS,
  QUANTITY,
  SHIPPING_AMOUNT_CENTS,
  SHIPPING_METHOD,
  TAX_AMOUNT_CENTS,
  TOTAL_AMOUNT_CENTS,
  isShirtSize,
} from "@/lib/constants";
import { getLambdaClient } from "@/lib/server/aws";
import { getStripe } from "@/lib/server/stripe";

export const runtime = "nodejs";

class CheckoutValidationError extends Error {}

function isExpandedPaymentIntent(
  value: string | Stripe.PaymentIntent | null,
): value is Stripe.PaymentIntent {
  return typeof value === "object" && value !== null;
}

type ValidatedShipping = {
  name: string;
  phone: string | null;
  address: {
    line1: string;
    line2: string | null;
    city: string;
    state: string | null;
    postalCode: string;
    country: "US";
  };
};

function requireShippingDetails(
  session: Stripe.Checkout.Session,
): ValidatedShipping {
  const shipping = session.shipping_details;
  const address = shipping?.address;

  if (
    !shipping?.name ||
    !address?.line1 ||
    !address.city ||
    !address.postal_code ||
    address.country !== "US"
  ) {
    throw new CheckoutValidationError("A complete US shipping address is required");
  }

  return {
    name: shipping.name,
    phone: shipping.phone ?? null,
    address: {
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      postalCode: address.postal_code,
      country: "US",
    },
  };
}

function validateCheckoutSession(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.order_id;
  const size = session.metadata?.size;
  const paymentIntent = session.payment_intent;

  if (
    session.mode !== "payment" ||
    !orderId ||
    session.client_reference_id !== orderId ||
    session.currency !== CURRENCY ||
    session.amount_subtotal !== PRODUCT_AMOUNT_CENTS ||
    session.total_details?.amount_shipping !== SHIPPING_AMOUNT_CENTS ||
    session.total_details.amount_tax !== TAX_AMOUNT_CENTS ||
    session.amount_total !== TOTAL_AMOUNT_CENTS ||
    !isShirtSize(size) ||
    session.metadata?.quantity !== String(QUANTITY) ||
    !isExpandedPaymentIntent(paymentIntent) ||
    paymentIntent.amount !== TOTAL_AMOUNT_CENTS ||
    paymentIntent.currency !== CURRENCY ||
    paymentIntent.capture_method !== "manual" ||
    paymentIntent.status !== "requires_capture" ||
    paymentIntent.metadata.order_id !== orderId ||
    paymentIntent.metadata.size !== size ||
    paymentIntent.metadata.quantity !== String(QUANTITY) ||
    paymentIntent.metadata.product_amount_cents !==
      String(PRODUCT_AMOUNT_CENTS) ||
    paymentIntent.metadata.shipping_amount_cents !==
      String(SHIPPING_AMOUNT_CENTS) ||
    paymentIntent.metadata.tax_amount_cents !== String(TAX_AMOUNT_CENTS) ||
    paymentIntent.metadata.shipping_method !== SHIPPING_METHOD ||
    paymentIntent.metadata.pricing_version !== PRICING_VERSION
  ) {
    throw new CheckoutValidationError("Checkout values did not match the order contract");
  }

  const shipping = requireShippingDetails(session);
  const email = session.customer_details?.email;

  if (!email) {
    throw new CheckoutValidationError("Customer email is required");
  }

  return { orderId, size, paymentIntent, shipping, email };
}

function paymentDetailsMatch(
  paymentIntent: Stripe.PaymentIntent,
  shipping: ValidatedShipping,
  email: string,
) {
  return (
    paymentIntent.receipt_email === email &&
    paymentIntent.shipping?.name === shipping.name &&
    paymentIntent.shipping?.address?.line1 === shipping.address.line1 &&
    paymentIntent.shipping?.address?.city === shipping.address.city &&
    paymentIntent.shipping?.address?.postal_code === shipping.address.postalCode &&
    paymentIntent.shipping?.address?.country === shipping.address.country
  );
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    );
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  let checkout;

  try {
    checkout = await stripe.checkout.sessions.retrieve(event.data.object.id, {
      expand: ["payment_intent", "shipping_cost.shipping_rate"],
    });
  } catch (error) {
    console.error("Unable to retrieve Stripe Checkout Session", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  let validated: ReturnType<typeof validateCheckoutSession>;

  try {
    validated = validateCheckoutSession(checkout);
  } catch (error) {
    if (error instanceof CheckoutValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }

  const { orderId, size, paymentIntent, shipping, email } = validated;
  const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME;

  if (!functionName) {
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  try {
    if (!paymentDetailsMatch(paymentIntent, shipping, email)) {
      await stripe.paymentIntents.update(paymentIntent.id, {
        receipt_email: email,
        shipping: {
          name: shipping.name,
          phone: shipping.phone || undefined,
          address: {
            line1: shipping.address.line1,
            line2: shipping.address.line2 || undefined,
            city: shipping.address.city,
            state: shipping.address.state || undefined,
            postal_code: shipping.address.postalCode,
            country: shipping.address.country,
          },
        },
      });
    }

    const response = await getLambdaClient().send(
      new InvokeCommand({
        FunctionName: functionName,
        InvocationType: "Event",
        Payload: Buffer.from(
          JSON.stringify({
            order_id: orderId,
            payment_intent_id: paymentIntent.id,
            size,
            quantity: QUANTITY,
          }),
        ),
      }),
    );

    if (response.StatusCode !== 202) {
      throw new Error(`Lambda returned status ${response.StatusCode}`);
    }
  } catch (error) {
    console.error("Unable to hand order to AWS Lambda", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
