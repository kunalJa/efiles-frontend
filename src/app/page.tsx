"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type RefObject } from "react";

const INTRO_VIDEO = "/intro-animation.mp4?v=menu-2";
const EASTER_VIDEO = "/easter-egg.mp4";

function ShirtPreview({ redacted }: { redacted?: boolean }) {
  return (
    <svg
      role="img"
      aria-label={redacted ? "White Redacted shirt preview" : "White Mystery File shirt preview"}
      viewBox="0 0 240 240"
      className="mx-auto h-full w-full max-w-48"
    >
      <path
        d="M75 36 91 25h58l16 11 43 21-20 41-25-11v122H77V87L52 98 32 57Z"
        fill="#f8f7f3"
        stroke="#aaa99f"
        strokeWidth="2"
      />
      <path d="M91 25c3 19 13 28 29 28s26-9 29-28" fill="none" stroke="#cccac3" strokeWidth="2" />
      <path d="M77 87v122m86-122v122" stroke="#e4e2da" strokeWidth="2" />
      {redacted ? (
        <g fill="#242522">
          <rect x="96" y="96" width="48" height="7" />
          <rect x="96" y="110" width="40" height="7" />
          <rect x="96" y="124" width="48" height="7" />
          <rect x="96" y="138" width="29" height="7" />
        </g>
      ) : (
        <>
          <rect x="93" y="94" width="54" height="61" fill="#e8e6dd" stroke="#a4a49b" />
          <text x="120" y="139" textAnchor="middle" fontFamily="serif" fontSize="44" fill="#35372f">?</text>
        </>
      )}
    </svg>
  );
}

function SpecialsCatalog({ onEasterEgg, filmNotice, scrollRef }: {
  onEasterEgg: () => void;
  filmNotice: string;
  scrollRef: RefObject<HTMLDivElement>;
}) {
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
          This streetwear project is controversial, and ultimately probably a lackluster attempt in bringing about change, but I think the edginess and curiosity of people seeing it in public might make it have some small impact. TBD (between 50-100%) of Net profits will be donated to <a href="https://www.worldwithoutexploitation.org" target="_blank" rel="noopener noreferrer" className="underline">World Without Exploitation</a>.
        </p>
      </section>

      <section className="border-t border-[#777b6b]/35 py-8" aria-labelledby="collection-heading">
        <h2 id="collection-heading" className="menu-heading text-center text-[clamp(2.3rem,4.2vw,3.6rem)] leading-none">the collection</h2>
        <p className="mt-2 text-center font-heading text-sm italic text-[#696d60]">Wear the question. Keep asking it.</p>

        <article className="mt-9 border-t border-[#777b6b]/35 pt-6">
          <div className="flex items-end justify-between gap-2">
            <h3 className="menu-heading text-[clamp(1.8rem,2.7vw,2.6rem)] leading-none">the mystery file</h3>
            <span className="font-heading text-xl">$44</span>
          </div>
          <p className="mt-2 font-heading text-sm italic text-[#747869]">An edition of one · White Gildan 5000 · S—XL</p>
          <div className="mt-5 aspect-[4/3] bg-[#dcded1] p-2"><ShirtPreview /></div>
          <p className="mt-4 font-heading text-[15px] leading-relaxed text-[#4b5045]">A unique document from the archive, chosen after you order. Worn as an invitation to look closer and keep asking questions.</p>
          <Link href="/checkout" className="menu-buy-button mt-5 inline-flex min-h-11 w-full items-center justify-between px-4 py-2 font-heading text-base">
            <span>Make it yours</span><span aria-hidden="true">↗</span>
          </Link>
          <p className="mt-2 font-heading text-xs italic text-[#707568]">+ $4.95 US shipping · $48.95 total</p>
        </article>

        <article className="mt-10 border-t border-[#777b6b]/35 pt-6">
          <div className="flex items-end justify-between gap-2">
            <h3 className="menu-heading text-[clamp(1.8rem,2.7vw,2.6rem)] leading-none">the redacted file</h3>
          </div>
          <p className="mt-2 font-heading text-sm italic text-[#747869]">An unreleased edition · Coming soon</p>
          <div className="mt-5 aspect-[4/3] bg-[#dcded1] p-2"><ShirtPreview redacted /></div>
          <p className="mt-4 font-heading text-[15px] leading-relaxed text-[#4b5045]">A second way to wear the conversation. The details are still under wraps—not the reason behind them.</p>
          <button type="button" disabled className="mt-5 min-h-11 w-full cursor-not-allowed border border-[#8d9185] px-4 py-2 text-left font-heading text-base text-[#737869]">
            Coming soon
          </button>
        </article>
      </section>

      <footer className="border-t border-[#777b6b]/35 pb-5 pt-8 text-center">
        <h2 className="menu-heading text-[clamp(2rem,3.8vw,3rem)] leading-none">the fine print</h2>
        <p className="mt-5 font-heading text-sm leading-relaxed text-[#55594e]">One shirt per order. Printed to order and shipped within the US. Stripe securely collects payment and delivery details. The file is assigned after checkout.</p>
        <p className="mt-4 font-heading text-sm italic leading-relaxed text-[#55594e]">Keep the conversation alive. Protect survivors. Demand the truth.</p>
        <button type="button" onClick={onEasterEgg} className="mt-8 border-b border-[#55594e] pb-1 font-heading text-sm italic text-[#55594e] hover:text-black">
          One more thing from the archive ↗
        </button>
        {filmNotice && <p role="status" className="mt-3 font-heading text-sm">{filmNotice}</p>}
        <p className="mt-10 font-heading text-xs italic text-[#8a8e80]">E-Files · End of menu</p>
      </footer>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [videoSrc, setVideoSrc] = useState(INTRO_VIDEO);
  const [showMenu, setShowMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [filmNotice, setFilmNotice] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const catalogRef = useRef<HTMLDivElement>(null);
  const menuVisible = showMenu || (isMobile && videoSrc === INTRO_VIDEO);

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
    overlayRef.current?.toggleAttribute("inert", !menuVisible);
  }, [menuVisible]);

  useEffect(() => {
    const stage = stageRef.current;
    const scroll = catalogRef.current;
    if (!stage || !scroll || !menuVisible) return;

    const redirectWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
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

  function playEasterEgg() {
    setFilmNotice("");
    setShowMenu(false);
    if (videoSrc === EASTER_VIDEO && videoRef.current) {
      videoRef.current.currentTime = 0;
      void videoRef.current.play().catch(() => setShowMenu(true));
    } else {
      setVideoSrc(EASTER_VIDEO);
    }
  }

  return (
    <main ref={stageRef} className="menu-stage flex h-screen w-screen items-center justify-center overflow-hidden bg-black text-white">
      <div className="relative flex aspect-video w-full max-h-full max-w-[177.777vh] items-center justify-center max-md:aspect-auto max-md:h-full max-md:max-w-none">
        <video
          key={videoSrc}
          ref={videoRef}
          src={videoSrc}
          autoPlay
          muted
          playsInline
          preload="auto"
          aria-label={videoSrc === INTRO_VIDEO ? "E-Files opening animation" : "E-Files hidden film"}
          onEnded={() => setShowMenu(true)}
          onError={() => {
            setShowMenu(true);
            if (videoSrc === EASTER_VIDEO) {
              setFilmNotice("The hidden reel is not ready yet. Check back soon.");
              setVideoSrc(INTRO_VIDEO);
            }
          }}
          style={{ imageRendering: "pixelated" }}
          className={`absolute inset-0 h-full w-full object-contain ${isMobile && videoSrc === INTRO_VIDEO ? "hidden" : ""}`}
        />

        {!menuVisible && (
          <button type="button" onClick={() => { videoRef.current?.pause(); setShowMenu(true); }} className="absolute bottom-6 right-6 z-20 border border-white/50 bg-black/60 px-4 py-2 font-mono text-xs uppercase tracking-widest text-white hover:bg-black" aria-label="Skip film and open the menu">
            Skip film ↗
          </button>
        )}

        <div
          ref={overlayRef}
          aria-hidden={!menuVisible}
          className={`absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-700 ${menuVisible ? "scale-100 opacity-100" : "pointer-events-none scale-[0.97] opacity-0"}`}
        >
          <div className="relative flex h-full aspect-[1006/1080] items-center justify-center shadow-2xl max-md:aspect-auto max-md:w-full max-md:shadow-none">
            <Image src="/background-menu.jpg?v=menu-2" alt="" fill unoptimized priority className="pointer-events-none absolute inset-0 h-full w-full object-cover max-md:hidden" />
            <div className="absolute left-0 top-1/2 h-[83.333333%] w-[59.642147%] -translate-y-1/2 max-md:relative max-md:top-auto max-md:h-[94%] max-md:w-[min(88%,480px)] max-md:translate-y-0">
              <Image src="/paperclip-back.svg?v=straight-2" alt="" width={200} height={80} unoptimized className="pointer-events-none absolute -left-5 top-10 z-0 h-auto w-32 max-md:hidden" />
              <div className="specials-cardstock specials-sheet-shadow absolute inset-0 z-10 rounded-sm">
                <SpecialsCatalog onEasterEgg={playEasterEgg} filmNotice={filmNotice} scrollRef={catalogRef} />
              </div>
              <Image src="/paperclip.svg?v=straight-2" alt="" width={200} height={80} unoptimized className="pointer-events-none absolute -left-5 top-10 z-20 h-auto w-32 max-md:hidden" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
