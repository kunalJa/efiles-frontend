"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LEGAL_LINKS, SupportEmail } from "@/components/LegalSheet";
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
  shipments?: { carrier?: string; trackingNumber?: string; trackingUrl?: string }[];
  volume?: number;
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
  const [playing, setPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [revealEnded, setRevealEnded] = useState(false);
  const [videoError, setVideoError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

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
          shipments: result.shipments,
          volume: result.volume,
        };
        setOrder(nextOrder);
        setNotice("");

        if (TERMINAL_STATUSES.has(nextOrder.status) && nextOrder.status !== "SOLD") return;
        if (nextOrder.status === "SOLD") {
          timeout = setTimeout(poll, 60000);
          return;
        }
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

  async function playReveal() {
    const video = videoRef.current;
    if (!video) return;
    setVideoError("");
    setRevealEnded(false);
    setHasStarted(false);
    setPlaying(true);
    try {
      if (video.readyState > 0) video.currentTime = 0;
      await video.play();
    } catch {
      setPlaying(false);
      setVideoError("The reveal could not play. Your order status is still available below.");
    }
  }

  const statusUnavailable = notice === "Order status is not configured";
  const isFailure = statusUnavailable || order.status === "FAILED" || order.status === "REFUNDED_FAILED";
  const isComplete = order.status === "SOLD";
  const lifecycleIndex = order.status === "PROCESSING_RETRY" ? 1 : lifecycle.indexOf(order.status as (typeof lifecycle)[number]);

  return (
    <main className="min-h-screen bg-[#d7d8ce] text-[#32352e]">
      <nav className="mx-auto grid w-full max-w-5xl grid-cols-[auto_minmax(0,1fr)] items-start gap-3 px-4 py-5 font-heading text-sm sm:flex sm:items-center sm:justify-between sm:px-6">
        <Link href="/" className="shrink-0 whitespace-nowrap border-b border-[#55594e] pb-1">Back to store</Link>
        <span className="min-w-0 text-right italic text-[#55594e]">
          <span className="block sm:inline">Order reference:</span>{" "}
          <span className="block break-all font-mono text-xs not-italic sm:inline sm:font-heading sm:text-sm sm:italic">{params.orderId}</span>
        </span>
      </nav>

      <section className="relative mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
        <Image src="/paperclip-back.svg?v=straight-2" alt="" width={200} height={80} unoptimized className="pointer-events-none absolute -left-1.5 top-6 z-0 hidden h-auto w-32 md:block" />
        <div className="specials-cardstock order-cardstock specials-sheet-shadow relative z-10 overflow-hidden rounded-sm">
          {!isFailure && (
            <div className="relative mx-auto mt-0 aspect-square w-full max-w-[620px] bg-[#dededb] md:z-10 md:mt-12">
              <video
                ref={videoRef}
                src="/lootbox-open.mp4"
                poster="/lootbox-poster.png"
                preload="auto"
                playsInline
                onPlaying={() => setHasStarted(true)}
                onEnded={() => { setPlaying(false); setRevealEnded(true); }}
                onError={() => { setPlaying(false); setHasStarted(false); setVideoError("The reveal could not load. Your order status is still available below."); }}
                className="absolute inset-0 h-full w-full object-cover"
                aria-label="Mystery shirt reveal"
              />
              {(!hasStarted || revealEnded) && (
                <Image
                  src={revealEnded ? "/lootbox-final.png?v=last-frame-3" : "/lootbox-poster.png"}
                  alt={revealEnded ? "White mystery shirt with a question mark after the reveal" : "A covered cloche, hiding the mystery shirt"}
                  fill
                  priority
                  unoptimized
                  className="pointer-events-none z-10 object-cover"
                />
              )}
              {revealEnded && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-[#252720]/40 px-4 py-4 text-center text-white backdrop-blur-[2px]">
                  <p className="font-heading text-xs uppercase tracking-[0.2em]">JK, find out what file you get when it arrives at your door!</p>
                </div>
              )}
              {!playing && <button type="button" onClick={() => void playReveal()} aria-label={hasStarted ? "Replay mystery shirt reveal with sound" : "Play mystery shirt reveal with sound"} className="absolute inset-0 z-30 w-full cursor-pointer focus-visible:ring-4 focus-visible:ring-[#55594e]" />}
            </div>
          )}
          <div className="relative z-10 mx-auto max-w-2xl px-6 pb-12 pt-6 sm:px-12">
            {!isFailure && <p className="text-center font-heading text-sm italic text-[#696d60]">Open the cloche to watch the reveal!</p>}
            {videoError && <p role="alert" className="mt-3 text-center font-heading text-sm text-[#a33d3d]">{videoError}</p>}
            <h1 className="menu-heading mt-7 text-center text-[clamp(2.8rem,7vw,4.5rem)] leading-none">{isFailure ? "error" : "Wear the Epstein Files"}</h1>
            <div className="mx-auto mt-6 flex max-w-52 items-center gap-3 text-[#777d6c]" aria-hidden="true"><span className="h-px flex-1 bg-current" /><span className="font-heading text-lg">✳</span><span className="h-px flex-1 bg-current" /></div>
            <p className="mt-6 text-center font-heading text-base leading-relaxed text-[#4b5045]">
              {statusUnavailable
                ? "We can't check this order right now because order status isn't configured. This does not mean your payment or order failed. Keep your order reference and check back before trying another purchase."
                : isFailure
                  ? "We couldn't complete this order. Please check the status below before trying again."
                  : isComplete
                  ? "Your shirt has been submitted for fulfillment. You will receive a confirmation email with details about your order shortly."
                  : order.status === "DRAFT_ONLY"
                    ? "This test order created a Printful draft, has not shipped."
                    : "You will receive a confirmation email with details about your order shortly."}
            </p>

            {(isComplete || order.status === "DRAFT_ONLY") && order.volume && (
              <div className="mt-8 border-t border-[#777b6b]/35 pt-6 text-center font-heading">
                <p className="text-xs uppercase tracking-[0.2em] text-[#696d60]">&quot;At least tell me what data set my shirt will be from!&quot;</p>
                <p className="menu-heading mt-3 text-[clamp(2.7rem,7vw,4rem)] leading-none">Data Set {order.volume}</p>
                <p className="mt-4 text-sm leading-relaxed text-[#55594e]">
                  {isComplete
                    ? "Look deeper into the type of content in this data set to learn more about what is contained in the Epstein Files. The exact document stays a surprise until your shirt arrives."
                    : "This test order was assigned a file from this data set, but its Printful draft will not ship."}
                </p>
              </div>
            )}

            <div aria-live="polite" className="mt-9 border-t border-[#777b6b]/35 pt-5 font-heading">
              <p className="text-xs uppercase tracking-widest text-[#696d60]">Order status</p>
              <p className="mt-2 text-lg">{statusUnavailable ? "Unable to check order status" : order.status === "PENDING" ? "Checking your order" : STATUS_MESSAGES[order.status]}</p>
              {!TERMINAL_STATUSES.has(order.status) && <p className="mt-2 text-sm text-[#55594e]">This page updates automatically. You can return using this link.</p>}
              {order.shirtSize && <p className="mt-3 text-sm text-[#55594e]">White Gildan 5000 · Size {order.shirtSize}</p>}
              {isComplete && <p className="mt-3 text-sm text-[#55594e]">Fulfillment: {order.fulfillmentStatus || "Awaiting update"}</p>}
              {isComplete && !order.shipments?.length && <p className="mt-2 text-sm text-[#55594e]">Tracking will appear here once your order ships. Shipping updates refresh while this page is open.</p>}
              {order.shipments?.map((shipment, index) => (
                <div key={index} className="mt-3 text-sm text-[#55594e]">
                  <p>Shipment {index + 1}{shipment.carrier ? ` · ${shipment.carrier}` : ""}{shipment.trackingNumber ? ` · ${shipment.trackingNumber}` : ""}</p>
                  {shipment.trackingUrl && <a href={shipment.trackingUrl} target="_blank" rel="noopener noreferrer" className="underline">Track shipment</a>}
                </div>
              ))}
              <p className="mt-3 break-all text-xs text-[#696d60]">Order reference: {params.orderId}</p>
            </div>
            {notice && <p role="alert" className="mt-5 border-l-2 border-[#a33d3d] pl-3 font-heading text-sm">{notice} We will try again automatically.</p>}

            {!isFailure && order.status !== "DRAFT_ONLY" && (
              <ol className="mt-7 space-y-3" aria-label="Order progress">
                {lifecycle.map((status, index) => (
                  <li key={status} className="flex items-center gap-3 font-heading text-sm">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${lifecycleIndex >= index ? "bg-[#3c4237]" : "border border-[#777b6b]"}`} />
                    <span className={lifecycleIndex >= index ? "text-[#32352e]" : "text-[#777b6b]"}>{STATUS_MESSAGES[status]}</span>
                  </li>
                ))}
              </ol>
            )}

            <section className="mt-9 border-t border-[#777b6b]/35 pt-6 font-heading text-sm leading-relaxed text-[#55594e]" aria-labelledby="project-note-heading">
              <h2 id="project-note-heading" className="menu-heading text-3xl text-[#32352e]">beyond the headlines</h2>
              <p className="mt-3">This project is an invitation to spend time with the public record—not only the headlines—and to keep asking what happened, who was protected, and where accountability is still owed.</p>
              <p className="mt-3">The goal is to encourage curiosity and sustained public attention. 100% of Net profits will be donated to <a href="https://www.worldwithoutexploitation.org" target="_blank" rel="noopener noreferrer" className="underline">World Without Exploitation</a>. Consider donating directly instead!</p>
              <a href="https://www.justice.gov/epstein/doj-disclosures" target="_blank" rel="noreferrer" className="mt-4 inline-flex border-b border-[#55594e] pb-1 text-[#32352e] hover:text-black">Browse the DOJ’s public disclosures <span className="ml-2" aria-hidden="true">↗</span></a>
            </section>

            <aside className="mt-8 border-t border-[#777b6b]/35 pt-6 font-heading text-sm leading-relaxed text-[#55594e]">
              <h2 className="menu-heading text-3xl text-[#32352e]">a note before it arrives</h2>
              <p className="mt-3">Some files are mundane emails or court documents. Others may contain images of people who appear in the files or many other interesting things. The file may not be suitable to printing on a shirt, or may have font or detail that becomes illegible when printed on a t-shirt.</p>
            </aside>
            <Link href="/" className="menu-buy-button mt-8 inline-flex min-h-11 w-full items-center justify-between px-4 py-2 font-heading text-base"><span>Buy another shirt</span><span aria-hidden="true">↗</span></Link>
            <footer className="mt-10 border-t border-[#777b6b]/35 pt-6 text-center font-heading text-sm text-[#55594e]">
              <p>Questions? Email <SupportEmail /> with your order reference.</p>
              <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2">
                {LEGAL_LINKS.map((link) => (
                  <li key={link.href}><Link href={link.href} className="border-b border-[#55594e] pb-0.5 hover:text-black">{link.label}</Link></li>
                ))}
              </ul>
            </footer>
          </div>
        </div>
        <Image src="/paperclip.svg?v=straight-2" alt="" width={200} height={80} unoptimized className="pointer-events-none absolute left-1 top-6 z-20 hidden h-auto w-32 md:block" />
      </section>
    </main>
  );
}
