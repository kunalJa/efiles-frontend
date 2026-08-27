"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  STATUS_MESSAGES,
  TERMINAL_STATUSES,
  isOrderStatus,
  type OrderStatus,
} from "@/lib/constants";

type OrderResponse = {
  orderId: string;
  status: OrderStatus;
  updatedAt?: string;
  shirtSize?: string;
  fulfillmentStatus?: string;
  fileId?: string;
};

const lifecycle = [
  "PENDING",
  "PROCESSING",
  "PRINTFUL_DRAFT_CREATED",
  "PAYMENT_CAPTURED",
  "SOLD",
] as const;

export default function OrderPage({ params }: { params: { orderId: string } }) {
  const [order, setOrder] = useState<OrderResponse>({
    orderId: params.orderId,
    status: "PENDING",
  });
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;

    async function poll() {
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(params.orderId)}/status`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const result = (await response.json()) as Partial<OrderResponse> & { error?: string };

        if (!response.ok && response.status !== 202) {
          throw new Error(result.error || "Unable to retrieve your order");
        }
        if (!isOrderStatus(result.status)) {
          throw new Error("The order service returned an unknown status");
        }

        const nextOrder = {
          orderId: params.orderId,
          status: result.status,
          updatedAt: result.updatedAt,
          shirtSize: result.shirtSize,
          fulfillmentStatus: result.fulfillmentStatus,
          fileId: result.fileId,
        };
        setOrder(nextOrder);
        setNotice("");

        if (TERMINAL_STATUSES.has(nextOrder.status)) return;
      } catch (error) {
        if (controller.signal.aborted) return;
        setNotice(error instanceof Error ? error.message : "Unable to retrieve your order");
      }

      attempts += 1;
      const delay = attempts < 12 ? 2500 : Math.min(10000, 2500 * 2 ** Math.floor((attempts - 12) / 4));
      timeout = setTimeout(poll, delay);
    }

    void poll();

    return () => {
      controller.abort();
      if (timeout) clearTimeout(timeout);
    };
  }, [params.orderId]);

  const isFailure = order.status === "FAILED" || order.status === "REFUNDED_FAILED";
  const lifecycleIndex = order.status === "PROCESSING_RETRY" ? 1 : lifecycle.indexOf(order.status as (typeof lifecycle)[number]);

  return (
    <main className="paper-texture flex min-h-screen flex-col bg-parchment-white">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="font-mono text-sm font-bold tracking-[0.24em]">E-FILES / ARCHIVE</Link>
        <span className="font-mono text-xs uppercase text-ink-black/50">Order record</span>
      </nav>

      <section className="mx-auto flex w-full max-w-3xl flex-1 items-center px-6 py-12">
        <div className="official-form w-full rounded-2xl border border-file-folder-brown/30 bg-parchment-white p-7 shadow-paper sm:p-12">
          <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 font-heading text-4xl font-bold ${isFailure ? "border-stamp-red text-stamp-red" : "border-metallic-gold bg-mystery-purple text-parchment-white"}`}>
            {isFailure ? "!" : order.status === "SOLD" || order.status === "DRAFT_ONLY" ? "E" : "…"}
          </div>

          <div aria-live="polite" className="mt-7 text-center">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-file-folder-brown">Current status / {order.status}</p>
            <h1 className="mx-auto mt-3 max-w-xl text-3xl font-bold sm:text-4xl">{STATUS_MESSAGES[order.status]}</h1>
            {!TERMINAL_STATUSES.has(order.status) && <p className="mt-4 text-ink-black/60">Keep this page open. It updates automatically while your file is prepared.</p>}
          </div>

          {notice && <p role="alert" className="mx-auto mt-6 max-w-xl border-l-4 border-slate-blue bg-slate-blue/10 p-4 text-sm">{notice} We will try again automatically.</p>}

          {!isFailure && (
            <ol className="mx-auto mt-10 max-w-xl space-y-3" aria-label="Order progress">
              {lifecycle.map((status, index) => {
                const complete = lifecycleIndex >= index || order.status === "DRAFT_ONLY";
                return (
                  <li key={status} className="flex items-center gap-4 font-mono text-xs uppercase tracking-wider">
                    <span className={`h-3 w-3 shrink-0 rounded-full border ${complete ? "border-mystery-purple bg-mystery-purple" : "border-file-folder-brown/40"}`} />
                    <span className={complete ? "text-ink-black" : "text-ink-black/40"}>{STATUS_MESSAGES[status]}</span>
                  </li>
                );
              })}
            </ol>
          )}

          {(order.status === "SOLD" || order.status === "DRAFT_ONLY") && order.fileId && (
            <div className="mx-auto mt-10 max-w-xl border-2 border-ink-black/20 bg-white/40 p-5 text-center">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-black/55">Assigned file ID</p>
              <p className="mt-2 break-all font-mono text-2xl font-bold tracking-wider sm:text-3xl">{order.fileId}</p>
            </div>
          )}

          <div className="mt-10 text-center">
            <Link href="/" className="btn-ghost inline-block">Return to archive</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
