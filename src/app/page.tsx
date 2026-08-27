"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Choose Your Size",
    description: "Pick S, M, L, or XL in a classic white Gildan 5000 tee.",
  },
  {
    number: "02",
    title: "Mystery Assignment",
    description: "One document is selected for you from our vast archive.",
  },
  {
    number: "03",
    title: "Your Unique File",
    description: "Your assigned artwork and file ID become a one-of-one shirt.",
  },
  {
    number: "04",
    title: "Printed & Delivered",
    description: "Your shirt is printed to order and shipped within the US.",
  },
];

const particles = [
  [8, 18],
  [17, 72],
  [26, 34],
  [38, 82],
  [49, 14],
  [58, 62],
  [69, 28],
  [77, 78],
  [88, 42],
  [94, 16],
];

export default function HomePage() {
  return (
    <main className="paper-texture min-h-screen overflow-hidden">
      <nav className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="font-mono text-sm font-bold tracking-[0.24em]">
          E-FILES / ARCHIVE
        </Link>
        <Link href="/checkout" className="btn-secondary py-2">
          Request a file
        </Link>
      </nav>

      <section className="relative flex min-h-screen items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-archive-yellow/45 via-parchment-white to-mystery-purple/15" />
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {particles.map(([left, top], index) => (
            <span
              key={`${left}-${top}`}
              className="dust-particle"
              style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${index * 0.7}s` }}
            />
          ))}
        </div>

        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-14 px-6 pb-16 pt-28 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="mb-5 font-mono text-xs font-bold uppercase tracking-[0.3em] text-file-folder-brown">
              Classified wearable archive / Series 001
            </p>
            <h1 className="max-w-3xl text-5xl font-bold leading-[1.02] text-ink-black sm:text-6xl lg:text-7xl">
              Discover Your Mystery File
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-ink-black/75 sm:text-xl">
              Each t-shirt contains a unique piece of archival artwork. Your file is selected only after your request is authorized.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/checkout" className="btn-primary text-center text-base">
                Reveal Your Mystery
              </Link>
              <a href="#how-it-works" className="btn-ghost text-center text-base">
                How It Works
              </a>
            </div>
            <p className="mt-6 font-mono text-xs uppercase tracking-wider text-ink-black/55">
              One shirt / one file / US shipping only
            </p>
          </motion.div>

          <motion.div
            className="mx-auto w-full max-w-md"
            animate={{ y: [0, -12, 0], rotate: [0, 1, -1, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="mystery-folder" aria-label="A sealed mystery archive folder">
              <div className="mystery-folder-tab">UNASSIGNED</div>
              <div className="mystery-folder-sheet">
                <span>ARCHIVE RECORD</span>
                <strong>?</strong>
                <small>CONTENTS RESTRICTED</small>
              </div>
              <div className="mystery-folder-seal">E</div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-file-folder-brown/25 bg-archive-yellow/35 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.28em] text-stamp-red">Procedure</p>
            <h2 className="mt-3 text-4xl font-bold sm:text-5xl">How It Works</h2>
            <p className="mt-4 text-lg text-ink-black/70">Four straightforward steps. The artwork remains a mystery until your order is prepared.</p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <motion.article
                key={step.number}
                className="file-folder-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.08 }}
              >
                <div className="folder-tab">STEP {step.number}</div>
                <div className="p-6 pt-9">
                  <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-full border border-metallic-gold bg-mystery-purple font-mono text-sm text-parchment-white">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="mt-3 leading-7 text-ink-black/65">{step.description}</p>
                </div>
              </motion.article>
            ))}
          </div>
          <div className="mt-14 text-center">
            <Link href="/checkout" className="btn-primary inline-block text-base">Choose your size</Link>
          </div>
        </div>
      </section>

      <footer className="bg-ink-black px-6 py-8 text-center text-parchment-white/70">
        <p className="font-mono text-xs uppercase tracking-[0.2em]">E-Files Shirts / Every document is one of a kind</p>
      </footer>
    </main>
  );
}
