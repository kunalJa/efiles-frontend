import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { LEGAL_LAST_UPDATED, SUPPORT_EMAIL } from "@/lib/constants";

export const LEGAL_LINKS = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/terms#refunds", label: "Refund & Return Policy" },
  { href: "/terms#shipping", label: "Shipping Policy" },
  { href: "/privacy", label: "Privacy Policy" },
] as const;

export function LegalSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-8 border-t border-[#777b6b]/35 pt-7" aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`} className="menu-heading text-[clamp(1.9rem,4vw,2.6rem)] leading-none text-[#32352e]">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

export function SupportEmail() {
  return <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">{SUPPORT_EMAIL}</a>;
}

export default function LegalSheet({ title, summary, children }: { title: string; summary: ReactNode; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#d7d8ce] text-[#32352e]">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5 font-heading text-sm">
        <Link href="/" className="border-b border-[#55594e] pb-1">Back to store</Link>
        <span className="italic text-[#55594e]">Last updated {LEGAL_LAST_UPDATED}</span>
      </nav>

      <section className="relative mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
        <Image src="/paperclip-back.svg?v=straight-2" alt="" width={200} height={80} unoptimized className="pointer-events-none absolute -left-1.5 top-6 z-0 hidden h-auto w-32 md:block" />
        <article className="specials-cardstock order-cardstock specials-sheet-shadow relative z-10 overflow-hidden rounded-sm">
          <div className="mx-auto max-w-2xl px-6 pb-12 pt-12 sm:px-12">
            <header className="text-center">
              <p className="font-heading text-sm italic text-[#696d60]">E-Files · the fine print</p>
              <h1 className="menu-heading mt-3 text-[clamp(2.8rem,7vw,4.5rem)] leading-[0.95]">{title}</h1>
              <div className="mx-auto mt-6 flex max-w-52 items-center gap-3 text-[#777d6c]" aria-hidden="true"><span className="h-px flex-1 bg-current" /><span className="font-heading text-lg">✳</span><span className="h-px flex-1 bg-current" /></div>
              <p className="mt-6 font-heading text-base leading-relaxed text-[#4b5045]">{summary}</p>
            </header>

            <div className="mt-9 space-y-9 font-heading text-sm leading-relaxed text-[#4b5045] sm:text-[15px]">{children}</div>

            <footer className="mt-10 border-t border-[#777b6b]/35 pt-6 text-center font-heading text-sm text-[#55594e]">
              <p>Questions? Email <SupportEmail />.</p>
              <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2">
                {LEGAL_LINKS.map((link) => (
                  <li key={link.href}><Link href={link.href} className="border-b border-[#55594e] pb-0.5 hover:text-black">{link.label}</Link></li>
                ))}
              </ul>
            </footer>
          </div>
        </article>
        <Image src="/paperclip.svg?v=straight-2" alt="" width={200} height={80} unoptimized className="pointer-events-none absolute left-1 top-6 z-20 hidden h-auto w-32 md:block" />
      </section>
    </main>
  );
}
