import Stripe from "stripe";
import { getLambdaClient } from "@/lib/server/aws";
import { getStripe } from "@/lib/server/stripe";
import { POST } from "../route";

jest.mock("@/lib/server/aws", () => ({ getLambdaClient: jest.fn() }));
jest.mock("@/lib/server/stripe", () => ({ getStripe: jest.fn() }));

const constructEvent = jest.fn();
const retrieveSession = jest.fn();
const updatePaymentIntent = jest.fn();
const sendLambda = jest.fn();

function validSession(): Stripe.Checkout.Session {
  return {
    id: "cs_test_123",
    mode: "payment",
    client_reference_id: "order_123",
    currency: "usd",
    amount_subtotal: 4400,
    amount_total: 4895,
    total_details: {
      amount_discount: 0,
      amount_shipping: 495,
      amount_tax: 0,
    },
    metadata: { order_id: "order_123", size: "L", quantity: "1" },
    customer_details: {
      address: null,
      email: "buyer@example.com",
      name: "Archive Buyer",
      phone: "5555555555",
      tax_exempt: "none",
      tax_ids: [],
    },
    shipping_details: {
      name: "Archive Buyer",
      phone: "5555555555",
      address: {
        city: "Boston",
        country: "US",
        line1: "1 Main Street",
        line2: null,
        postal_code: "02108",
        state: "MA",
      },
    },
    payment_intent: {
      id: "pi_test_123",
      amount: 4895,
      currency: "usd",
      capture_method: "manual",
      status: "requires_capture",
      receipt_email: null,
      shipping: null,
      metadata: {
        order_id: "order_123",
        size: "L",
        quantity: "1",
        product_amount_cents: "4400",
        shipping_amount_cents: "495",
        tax_amount_cents: "0",
        shipping_method: "STANDARD",
        pricing_version: "usd-us-fixed-v1",
      },
    } as unknown as Stripe.PaymentIntent,
  } as unknown as Stripe.Checkout.Session;
}

function webhookRequest() {
  return new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    headers: { "stripe-signature": "signed-header" },
    body: "raw-webhook-body",
  });
}

beforeEach(() => {
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  process.env.EFILES_LAMBDA_FUNCTION_NAME = "efiles-order-processor";
  jest.mocked(getStripe).mockReturnValue({
    webhooks: { constructEvent },
    checkout: { sessions: { retrieve: retrieveSession } },
    paymentIntents: { update: updatePaymentIntent },
  } as unknown as ReturnType<typeof getStripe>);
  jest.mocked(getLambdaClient).mockReturnValue({
    send: sendLambda,
  } as unknown as ReturnType<typeof getLambdaClient>);
  constructEvent.mockReturnValue({
    type: "checkout.session.completed",
    data: { object: { id: "cs_test_123" } },
  });
  retrieveSession.mockResolvedValue(validSession());
  updatePaymentIntent.mockResolvedValue({});
  sendLambda.mockResolvedValue({ StatusCode: 202 });
});

test("verifies the raw body, validates checkout, and invokes Lambda asynchronously", async () => {
  const response = await POST(webhookRequest());

  expect(response.status).toBe(200);
  expect(constructEvent).toHaveBeenCalledWith(
    "raw-webhook-body",
    "signed-header",
    "whsec_test",
  );
  expect(retrieveSession).toHaveBeenCalledWith("cs_test_123", {
    expand: ["payment_intent", "shipping_cost.shipping_rate"],
  });
  expect(updatePaymentIntent).toHaveBeenCalledWith(
    "pi_test_123",
    expect.objectContaining({
      receipt_email: "buyer@example.com",
      shipping: expect.objectContaining({ name: "Archive Buyer" }),
    }),
  );

  const command = sendLambda.mock.calls[0][0];
  expect(command.input.InvocationType).toBe("Event");
  expect(command.input.FunctionName).toBe("efiles-order-processor");
  expect(JSON.parse(Buffer.from(command.input.Payload).toString())).toEqual({
    order_id: "order_123",
    payment_intent_id: "pi_test_123",
    size: "L",
    quantity: 1,
  });
});

test("rejects an invalid Stripe signature before side effects", async () => {
  constructEvent.mockImplementation(() => {
    throw new Error("bad signature");
  });

  const response = await POST(webhookRequest());

  expect(response.status).toBe(400);
  expect(retrieveSession).not.toHaveBeenCalled();
  expect(sendLambda).not.toHaveBeenCalled();
});

test("rejects tampered authoritative checkout values", async () => {
  retrieveSession.mockResolvedValue({ ...validSession(), amount_total: 1 });

  const response = await POST(webhookRequest());

  expect(response.status).toBe(400);
  expect(sendLambda).not.toHaveBeenCalled();
});

test("returns 500 when AWS does not accept the event", async () => {
  sendLambda.mockRejectedValue(new Error("AWS unavailable"));

  const response = await POST(webhookRequest());

  expect(response.status).toBe(500);
});
