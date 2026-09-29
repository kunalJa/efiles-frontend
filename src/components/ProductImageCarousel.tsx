"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export type ProductImage = {
  src: string;
  alt: string;
  label: string;
  width: number;
  height: number;
};

type ProductImageCarouselProps = {
  productName: string;
  images: readonly [ProductImage, ...ProductImage[]];
};

export default function ProductImageCarousel({ productName, images }: ProductImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const image = images[activeIndex];

  const selectPhoto = (index: number) => {
    setActiveIndex((index + images.length) % images.length);
    viewerRef.current?.scrollTo(0, 0);
  };

  return (
    <div className="mt-5">
      <div className="relative bg-white" style={{ aspectRatio: `${images[0].width} / ${images[0].height}` }}>
        <button type="button" onClick={() => dialogRef.current?.showModal()} aria-label={`View ${productName} ${image.label} photo larger`} className="absolute inset-0 cursor-zoom-in">
          <Image src={image.src} alt={image.alt} fill sizes="(max-width: 767px) 80vw, 540px" className="object-contain" />
        </button>
        <button type="button" onClick={() => selectPhoto(activeIndex - 1)} aria-label={`Previous ${productName} photo`} className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-xl text-white hover:bg-black/70">←</button>
        <button type="button" onClick={() => selectPhoto(activeIndex + 1)} aria-label={`Next ${productName} photo`} className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-xl text-white hover:bg-black/70">→</button>
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 rounded-full bg-black/20 px-2" role="group" aria-label={`Choose ${productName} photo`}>
          {images.map((photo, index) => (
            <button key={photo.src} type="button" onClick={() => selectPhoto(index)} aria-label={`Show ${productName} ${photo.label} photo`} aria-current={index === activeIndex ? "true" : undefined} className="flex h-9 w-8 items-center justify-center">
              <span className={`h-2 w-2 rounded-full ${index === activeIndex ? "bg-white" : "bg-white/50"}`} />
            </button>
          ))}
        </div>
      </div>
      <dialog ref={dialogRef} aria-label={`${productName} photo viewer`} onClose={() => setZoomed(false)} onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }} onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          selectPhoto(activeIndex + (event.key === "ArrowLeft" ? -1 : 1));
        }
      }} className="fixed inset-0 m-auto flex h-[min(94dvh,1000px)] w-[min(94vw,1150px)] max-w-none flex-col overflow-hidden bg-[#e5e5e0] p-3 text-[#32352e] shadow-2xl backdrop:bg-black/80 [&:not([open])]:hidden">
        <div className="flex shrink-0 items-center justify-between gap-3 pb-3 font-heading text-sm">
          <span>{image.label} · {activeIndex + 1} / {images.length}</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setZoomed((value) => !value); viewerRef.current?.scrollTo(0, 0); }} className="min-h-10 border border-[#777b6b] px-3">{zoomed ? "Fit image" : "Zoom"}</button>
            <button type="button" onClick={() => dialogRef.current?.close()} aria-label={`Close ${productName} photo viewer`} className="min-h-10 border border-[#777b6b] px-3">Close ×</button>
          </div>
        </div>
        <div ref={viewerRef} className="relative min-h-0 flex-1 overflow-auto bg-white">
          {zoomed ? (
            <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes={`${image.width}px`} className="mx-auto h-auto max-w-none" />
          ) : (
            <Image src={image.src} alt={image.alt} fill sizes="(max-width: 767px) 94vw, 1150px" className="object-contain" />
          )}
        </div>
        <div className="flex shrink-0 items-center justify-between gap-3 pt-3 font-heading text-sm">
          <button type="button" onClick={() => selectPhoto(activeIndex - 1)} aria-label={`Previous ${productName} photo in viewer`} className="min-h-10 border border-[#777b6b] px-3">← Previous</button>
          <span aria-live="polite">{activeIndex + 1} / {images.length}</span>
          <button type="button" onClick={() => selectPhoto(activeIndex + 1)} aria-label={`Next ${productName} photo in viewer`} className="min-h-10 border border-[#777b6b] px-3">Next →</button>
        </div>
      </dialog>
    </div>
  );
}
