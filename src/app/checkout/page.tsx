"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SIZES, type ShirtSize } from "@/lib/constants";

export default function CheckoutPage() {
  const [size, setSize] = useState<ShirtSize | null>(null);
  const [loading, setLoading] = useState(false);
  const [canceled, setCanceled] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setCanceled(new URLSearchParams(window.location.search).get("canceled") === "1");
  }, []);

  async function startCheckout() {
    if (!size || loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ size }),
      });
      const result = (await response.json()) as {
        checkoutUrl?: string;
        error?: string;
      };

      if (!response.ok || !result.checkoutUrl) {
        throw new Error(result.error || "Unable to start checkout");
      }

      window.location.assign(result.checkoutUrl);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Unable to start checkout",
      );
      setLoading(false);
    }
  }

  return (
    <main className="paper-texture min-h-screen bg-parchment-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="font-mono text-sm font-bold tracking-[0.24em]">E-FILES / ARCHIVE</Link>
        <Link href="/" className="text-sm font-bold text-mystery-purple hover:underline">Return to archive</Link>
      </nav>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 pb-20 pt-8 lg:grid-cols-2 lg:px-10 lg:pt-16">
        <div className="flex items-center justify-center rounded-2xl border border-file-folder-brown/20 bg-archive-yellow/35 p-8 sm:p-14">
          <div className="product-file">
            <div className="product-file-tab">MYSTERY FILE</div>
            <div className="product-shirt" aria-label="White mystery t-shirt preview">
              <span>?</span>
            </div>
            <p>ARTWORK ASSIGNED AFTER AUTHORIZATION</p>
          </div>
        </div>

        <div className="official-form relative overflow-hidden rounded-2xl border border-file-folder-brown/30 bg-parchment-white p-7 shadow-paper sm:p-10">
          <div className="absolute right-5 top-5 rotate-6 border-2 border-stamp-red px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-stamp-red">Limited edition</div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-file-folder-brown">Official request form / EF-001</p>
          <h1 className="mt-4 max-w-md text-4xl font-bold leading-tight">Mystery Document T-Shirt</h1>
          <p className="mt-4 leading-7 text-ink-black/65">A white Gildan 5000 printed with one unique piece from the E-Files archive. Quantity is fixed at one.</p>

          {canceled && (
            <div role="status" className="mt-6 border-l-4 border-slate-blue bg-slate-blue/10 p-4 text-sm">
              Checkout was canceled. Your card was not charged, and you can continue whenever you are ready.
            </div>
          )}

          <fieldset className="mt-8">
            <legend className="font-mono text-sm font-bold uppercase tracking-wider">Select shirt size</legend>
            <div className="mt-3 grid grid-cols-4 gap-3">
              {SIZES.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={size === option}
                  onClick={() => setSize(option)}
                  className={`min-h-14 rounded border-2 font-mono text-lg font-bold transition ${
                    size === option
                      ? "border-metallic-gold bg-mystery-purple text-white shadow-gold"
                      : "border-file-folder-brown/30 bg-white/50 hover:border-file-folder-brown"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-8 border-y border-dashed border-file-folder-brown/40 py-5 font-mono text-sm">
            <div className="flex justify-between py-1"><span>White Gildan 5000</span><span>$44.00</span></div>
            <div className="flex justify-between py-1 text-ink-black/65"><span>Standard US shipping</span><span>$4.95</span></div>
            <div className="mt-3 flex justify-between border-t border-ink-black/15 pt-4 text-lg font-bold"><span>Total</span><span>$48.95 USD</span></div>
          </div>

          <p className="mt-5 text-sm leading-6 text-ink-black/60">US shipping only. Stripe securely collects your email, address, and card details on the next page. Payment is authorized before your file is prepared.</p>

          {error && <p role="alert" className="mt-5 border-2 border-stamp-red/60 p-3 font-mono text-sm text-stamp-red">{error}</p>}

          <button
            type="button"
            disabled={!size || loading}
            onClick={startCheckout}
            className="btn-primary mt-7 w-full disabled:cursor-not-allowed disabled:opacity-45"
          >
            {loading ? "Opening secure checkout..." : size ? `Buy size ${size} — $48.95` : "Choose a size to continue"}
          </button>
          <p className="mt-3 text-center font-mono text-xs uppercase tracking-wider text-ink-black/45">Secure checkout hosted by Stripe</p>
        </div>
      </section>
    </main>
  );
}
