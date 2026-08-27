import { getStripe } from "@/lib/server/stripe";
import { POST } from "../route";

jest.mock("@/lib/server/stripe", () => ({ getStripe: jest.fn() }));

const createSession = jest.fn();
const mockedGetStripe = jest.mocked(getStripe);

beforeEach(() => {
  process.env.APP_URL = "http://localhost:3000";
  mockedGetStripe.mockReturnValue({
    checkout: { sessions: { create: createSession } },
  } as unknown as ReturnType<typeof getStripe>);
  createSession.mockResolvedValue({ url: "https://checkout.stripe.test/session" });
});

test("creates a fixed-price hosted Checkout Session", async () => {
  const response = await POST(
    new Request("http://localhost/api/checkout/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ size: "M" }),
    }),
  );
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body).toEqual({
    orderId: expect.stringMatching(/^[a-f0-9]{32}$/),
    checkoutUrl: "https://checkout.stripe.test/session",
  });
  expect(createSession).toHaveBeenCalledTimes(1);

  const [session, options] = createSession.mock.calls[0];
  expect(session).toMatchObject({
    mode: "payment",
    client_reference_id: body.orderId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: 4400,
          product_data: {
            name: "E-Files Mystery Document T-Shirt",
            description: "White Gildan 5000 — Size M",
          },
        },
        quantity: 1,
      },
    ],
    shipping_address_collection: { allowed_countries: ["US"] },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 495, currency: "usd" },
          display_name: "Standard US shipping",
        },
      },
    ],
    automatic_tax: { enabled: false },
    metadata: { order_id: body.orderId, size: "M", quantity: "1" },
    payment_intent_data: {
      capture_method: "manual",
      metadata: {
        order_id: body.orderId,
        size: "M",
        quantity: "1",
        product_amount_cents: "4400",
        shipping_amount_cents: "495",
        tax_amount_cents: "0",
        shipping_method: "STANDARD",
        pricing_version: "usd-us-fixed-v1",
      },
    },
    success_url: `http://localhost:3000/orders/${body.orderId}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: "http://localhost:3000/checkout?canceled=1",
  });
  expect(options.idempotencyKey).toMatch(/^[a-f0-9]{32}$/);
});

test("rejects invalid sizes and additional browser fields", async () => {
  const response = await POST(
    new Request("http://localhost/api/checkout/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ size: "2XL", amount: 1 }),
    }),
  );

  expect(response.status).toBe(400);
  expect(createSession).not.toHaveBeenCalled();
});
