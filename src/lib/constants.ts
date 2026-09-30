export const SIZES = ["S", "M", "L", "XL"] as const;

export type ShirtSize = (typeof SIZES)[number];

export const PRODUCT_AMOUNT_CENTS = 4400;
export const SHIPPING_AMOUNT_CENTS = 495;
export const TAX_AMOUNT_CENTS = 0;
export const TOTAL_AMOUNT_CENTS = 4895;
export const CURRENCY = "usd";
export const QUANTITY = 1;
export const SHIPPING_METHOD = "STANDARD";
export const PRICING_VERSION = "usd-us-fixed-v1";

export const SUPPORT_EMAIL = "REPLACE_WITH_SUPPORT_EMAIL";
export const LEGAL_LAST_UPDATED = "September 30, 2026";

export const ORDER_STATUSES = [
  "PENDING",
  "PROCESSING",
  "PROCESSING_RETRY",
  "PRINTFUL_DRAFT_CREATED",
  "PAYMENT_CAPTURED",
  "DRAFT_ONLY",
  "SOLD",
  "FAILED",
  "REFUNDED_FAILED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_MESSAGES: Record<OrderStatus, string> = {
  PENDING: "Payment authorized; starting your order",
  PROCESSING: "Preparing your unique document",
  PROCESSING_RETRY: "Still preparing your order",
  PRINTFUL_DRAFT_CREATED: "Print files accepted",
  PAYMENT_CAPTURED: "Payment captured; submitting for fulfillment",
  DRAFT_ONLY: "Test order complete; Printful draft created",
  SOLD: "Order submitted for fulfillment",
  FAILED: "Order could not be completed; authorization released",
  REFUNDED_FAILED: "Order failed after capture; refund initiated",
};

export const TERMINAL_STATUSES = new Set<OrderStatus>([
  "SOLD",
  "DRAFT_ONLY",
  "FAILED",
  "REFUNDED_FAILED",
]);

export function isShirtSize(value: unknown): value is ShirtSize {
  return typeof value === "string" && SIZES.includes(value as ShirtSize);
}

export function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === "string" &&
    ORDER_STATUSES.includes(value as OrderStatus)
  );
}
