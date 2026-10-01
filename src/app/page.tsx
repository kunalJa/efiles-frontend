"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type RefObject } from "react";
import { LEGAL_LINKS, SupportEmail } from "@/components/LegalSheet";
import ProductImageCarousel, { type ProductImage } from "@/components/ProductImageCarousel";
import { SIZES, isShirtSize, type ShirtSize } from "@/lib/constants";

const INTRO_VIDEO = "/intro-animation-h264.mp4";
const PRODUCT_IMAGES = [
  { src: "/eft01_question_front.png?v=photos-2", alt: "White Mystery File shirt front with question mark design", label: "Mystery front", width: 2241, height: 2304 },
  { src: "/eft01_front.png?v=photos-2", alt: "White Mystery File shirt front with document print", label: "Document front", width: 2241, height: 2304 },
  { src: "/eft01_back.png?v=photos-2", alt: "White Mystery File shirt back with file ID print", label: "File ID back", width: 2241, height: 2304 },
] as const satisfies readonly [ProductImage, ...ProductImage[]];

function SpecialsCatalog({ scrollRef, canceled, returnSize }: {
  scrollRef: RefObject<HTMLDivElement>;
  canceled: boolean;
  returnSize: ShirtSize | null;
}) {
  const [size, setSize] = useState<ShirtSize | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (returnSize) setSize(returnSize);
  }, [returnSize]);

  async function purchase() {
    if (!size || loading) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ size }),
      });
      const result = (await response.json()) as { checkoutUrl?: string; error?: string };
      if (!response.ok || !result.checkoutUrl) {
        throw new Error(result.error || "Unable to start checkout");
      }
      window.location.assign(result.checkoutUrl);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Unable to start checkout");
      setLoading(false);
    }
  }

  return (
    <div ref={scrollRef} className="no-scrollbar absolute inset-0 overflow-y-auto overscroll-contain text-[#32352e] max-md:-left-5 max-md:w-[calc(100%+1.25rem)]">
      <div className="relative min-h-full px-[9%] pb-10 pt-10 sm:pt-12 max-md:pl-[calc(9%+1.25rem)]">
        <Image src="/paperclip-back.svg?v=straight-2" alt="" width={200} height={80} unoptimized className="pointer-events-none absolute left-0 top-10 z-0 hidden h-auto w-32 max-md:block" />
        <div aria-hidden="true" className="specials-cardstock absolute inset-y-0 left-5 right-0 z-10 hidden max-md:block" />
        <Image src="/paperclip.svg?v=straight-2" alt="" width={200} height={80} unoptimized className="pointer-events-none absolute left-0 top-10 z-30 hidden h-auto w-32 max-md:block" />
        <div className="relative z-20">
      <header className="pb-8 pt-1 text-center">
        <h1 className="menu-heading mt-3 text-[clamp(3.5rem,6vw,5.5rem)] leading-[0.9]">specials</h1>
        <p className="mt-3 font-heading text-sm italic text-[#696d60]">A conceptual clothing project</p>
        <div className="mx-auto mt-6 flex max-w-52 items-center gap-3 text-[#777d6c]" aria-hidden="true"><span className="h-px flex-1 bg-current" /><span className="font-heading text-lg">✳</span><span className="h-px flex-1 bg-current" /></div>
      </header>

      <section className="pb-9 pt-1" aria-labelledby="manifesto-heading">
        <h2 id="manifesto-heading" className="menu-heading text-center text-[clamp(2.2rem,4vw,3.3rem)] leading-[0.95]">manifesto</h2>
        <p className="mt-5 font-heading text-[15px] leading-relaxed text-[#4b5045] sm:text-base">
          Public interest and the brave voice of victims are the only reasons the Epstein case, quietly quashed in 2008, continued to be investigated. Without intense public interest, the FBI and the U.S. attorney’s office in Manhattan may never have looked closer in 2018. The facts of the Epstein case are harrowing and yet in 2026 so few people have been held accountable and so few details about this seemingly international criminal system have come to light. The headlines move on, but renewed public interest is all it takes for the sniffing dogs of media to hound after a topic.
        </p>
        <p className="mt-4 font-heading text-[15px] leading-relaxed text-[#4b5045] sm:text-base">
          This streetwear project is controversial, and ultimately a tiny step towards change, but perhaps we can engage with public curiosity as people ask just what is on our shirts. 100% of Net profits will be donated to <a href="https://www.worldwithoutexploitation.org" target="_blank" rel="noopener noreferrer" className="underline">World Without Exploitation</a>. Consider donating directly instead!
        </p>
      </section>

      <section className="border-t border-[#777b6b]/35 py-8" aria-labelledby="collection-heading">
        <h2 id="collection-heading" className="menu-heading text-center text-[clamp(2.3rem,4.2vw,3.6rem)] leading-none">what file will you get?</h2>
        <p className="mt-2 text-center font-heading text-sm italic text-[#696d60]">Each shirt will uniquely display one of the over 1 million Epstein files. You will have a random file and its unique file number on the back.</p>

        <article className="mt-9 border-t border-[#777b6b]/35 pt-6">
          <p className="mt-2 font-heading text-sm italic text-[#747869]">1 of 1 · White Gildan 5000 tee</p>
          <ProductImageCarousel productName="Mystery File shirt" images={PRODUCT_IMAGES} />
          <div className="mt-3 flex items-center justify-between gap-2">
            <h3 className="menu-heading text-[clamp(1.8rem,2.7vw,2.6rem)] leading-none">white tee</h3>
            <span className="font-heading text-xl leading-none">$44</span>
          </div>
          <div id="purchase" className="mt-0 pt-4">
            {canceled && <p role="status" className="mb-5 border-l-2 border-[#777b6b] pl-3 font-heading text-sm">Checkout was canceled. Your card was not charged. You can try again whenever you’re ready.</p>}
            <fieldset>
              <legend className="font-heading text-base">Select your size</legend>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {SIZES.map((option) => (
                  <button key={option} type="button" aria-pressed={size === option} onClick={() => setSize(option)} className={`min-h-12 border font-heading text-base transition ${size === option ? "border-[#32382f] bg-[#3c4237] text-white" : "border-[#777b6b]/50 hover:border-[#32382f]"}`}>{option}</button>
                ))}
              </div>
            </fieldset>
            <p className="mt-4 font-heading text-sm text-[#55594e]">$44 shirt + $4.95 standard US shipping</p>
            <p className="mt-3 font-heading text-sm leading-relaxed text-[#55594e]">Content note: Your assigned file could be an ordinary email or court document, or contain potentially distressing references. Which file you will get is a surprise.</p>
            {error && <p role="alert" className="mt-4 border-l-2 border-[#a33d3d] pl-3 font-heading text-sm text-[#a33d3d]">{error}</p>}
            <button type="button" disabled={!size || loading} onClick={purchase} className="menu-buy-button mt-5 flex min-h-16 w-full items-center justify-between px-4 py-2 font-heading text-base disabled:cursor-not-allowed disabled:opacity-50">
              <span>{loading ? "Opening secure checkout…" : "Checkout"}</span><span aria-hidden="true">↗</span>
            </button>
            <p className="mt-3 font-heading text-xs leading-relaxed text-[#707568]">All sales are final; refunds only if your order fails to ship. By checking out, you agree to our <Link href="/terms" className="underline">Terms of Service</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.</p>
          </div>
        </article>

      </section>

      <footer className="border-t border-[#777b6b]/35 pb-5 pt-8 text-center">
        <h2 className="menu-heading text-[clamp(2rem,3.8vw,3rem)] leading-none">the fine print</h2>
        <ul className="mt-5 space-y-2 font-heading text-sm text-[#55594e]">
          {LEGAL_LINKS.map((link) => (
            <li key={link.href}><Link href={link.href} className="border-b border-[#55594e]/60 pb-0.5 hover:text-black">{link.label}</Link></li>
          ))}
          <li>Contact: <SupportEmail /></li>
        </ul>
        <p className="mt-8 font-heading text-xs italic text-[#8a8e80]">E-Files · End of menu</p>
      </footer>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [showMenu, setShowMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [checkoutReturn, setCheckoutReturn] = useState<{ canceled: boolean; size: ShirtSize | null }>({ canceled: false, size: null });
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const catalogRef = useRef<HTMLDivElement>(null);
  const menuVisible = showMenu || isMobile;

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncViewport = () => {
      setIsMobile(mobile.matches);
      if (mobile.matches || reducedMotion.matches) {
        setShowMenu(true);
        videoRef.current?.pause();
      }
    };
    syncViewport();
    mobile.addEventListener("change", syncViewport);
    reducedMotion.addEventListener("change", syncViewport);
    return () => {
      mobile.removeEventListener("change", syncViewport);
      reducedMotion.removeEventListener("change", syncViewport);
    };
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("canceled") !== "1") return;
    const size = query.get("size");
    setCheckoutReturn({ canceled: true, size: isShirtSize(size) ? size : null });
    videoRef.current?.pause();
    setShowMenu(true);
  }, []);

  useEffect(() => {
    overlayRef.current?.toggleAttribute("inert", !menuVisible);
    if (!menuVisible || !checkoutReturn.canceled) return;
    const scroll = catalogRef.current;
    const purchase = scroll?.querySelector<HTMLElement>("#purchase");
    if (scroll && purchase) scroll.scrollTop += purchase.getBoundingClientRect().top - scroll.getBoundingClientRect().top - 24;
  }, [menuVisible, checkoutReturn.canceled]);

  useEffect(() => {
    const stage = stageRef.current;
    const scroll = catalogRef.current;
    if (!stage || !scroll || !menuVisible) return;

    const redirectWheel = (event: WheelEvent) => {
      if (event.ctrlKey || (event.target instanceof Element && event.target.closest("dialog[open]"))) return;
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? scroll.clientHeight : 1;
      scroll.scrollTop += event.deltaY * unit;
    };
    let lastTouchY: number | null = null;
    const startTouch = (event: TouchEvent) => {
      lastTouchY = event.touches.length === 1 && !scroll.contains(event.target as Node)
        ? event.touches[0].clientY
        : null;
    };
    const redirectTouch = (event: TouchEvent) => {
      if (lastTouchY === null || event.touches.length !== 1) return;
      event.preventDefault();
      const nextY = event.touches[0].clientY;
      scroll.scrollTop += lastTouchY - nextY;
      lastTouchY = nextY;
    };
    const endTouch = () => { lastTouchY = null; };

    stage.addEventListener("wheel", redirectWheel, { passive: false });
    stage.addEventListener("touchstart", startTouch, { passive: true });
    stage.addEventListener("touchmove", redirectTouch, { passive: false });
    stage.addEventListener("touchend", endTouch);
    return () => {
      stage.removeEventListener("wheel", redirectWheel);
      stage.removeEventListener("touchstart", startTouch);
      stage.removeEventListener("touchmove", redirectTouch);
      stage.removeEventListener("touchend", endTouch);
    };
  }, [menuVisible]);

  return (
    <main ref={stageRef} className="menu-stage flex h-screen w-screen items-center justify-center overflow-hidden bg-black text-white">
      <div className="relative flex aspect-video w-full max-h-full max-w-[177.777vh] items-center justify-center max-md:aspect-auto max-md:h-full max-md:max-w-none">
        <video
          ref={videoRef}
          src={INTRO_VIDEO}
          autoPlay
          muted
          playsInline
          preload="auto"
          aria-label="E-Files opening animation"
          onEnded={() => setShowMenu(true)}
          onError={() => setShowMenu(true)}
          style={{ imageRendering: "pixelated" }}
          className="absolute inset-0 h-full w-full object-contain max-md:hidden"
        />

        {!menuVisible && (
          <button type="button" onClick={() => { videoRef.current?.pause(); setShowMenu(true); }} className="absolute bottom-6 right-6 z-20 border border-white/50 bg-black/60 px-4 py-2 font-mono text-xs uppercase tracking-widest text-white hover:bg-black max-md:hidden" aria-label="Skip film and open the menu">
            Skip film ↗
          </button>
        )}

        <div
          ref={overlayRef}
          aria-hidden={!menuVisible}
          className={`absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-700 max-md:scale-100 max-md:opacity-100 max-md:pointer-events-auto ${menuVisible ? "scale-100 opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <div className="relative flex h-full aspect-[1006/1080] items-center justify-center shadow-2xl max-md:aspect-auto max-md:w-full max-md:shadow-none">
            <Image src="/background-menu.jpg?v=menu-2" alt="" fill unoptimized priority className="pointer-events-none absolute inset-0 h-full w-full object-cover max-md:hidden" />
            <div className="absolute left-0 top-1/2 h-[83.333333%] w-[59.642147%] -translate-y-1/2 max-md:relative max-md:top-auto max-md:h-[94%] max-md:w-[min(88%,480px)] max-md:translate-y-0">
              <Image src="/paperclip-back.svg?v=straight-2" alt="" width={200} height={80} unoptimized className="pointer-events-none absolute -left-5 top-10 z-0 h-auto w-32 max-md:hidden" />
              <div className="specials-cardstock specials-sheet-shadow absolute inset-0 z-10 rounded-sm">
                <SpecialsCatalog scrollRef={catalogRef} canceled={checkoutReturn.canceled} returnSize={checkoutReturn.size} />
              </div>
              <Image src="/paperclip.svg?v=straight-2" alt="" width={200} height={80} unoptimized className="pointer-events-none absolute -left-5 top-10 z-20 h-auto w-32 max-md:hidden" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
