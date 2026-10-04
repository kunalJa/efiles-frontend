import type { Metadata, Viewport } from "next";
import { Courier_Prime, Lato, Playfair_Display } from "next/font/google";
import "./globals.css";

const headingFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const bodyFont = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-body",
  display: "swap",
});

const monoFont = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "mysteryfile.store",
    template: "%s | mysteryfile.store",
  },
  description:
    "Discover a one-of-a-kind mystery t-shirt featuring unique archival artwork.",
};

export const viewport: Viewport = {
  themeColor: "#FDF5E6",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${headingFont.variable} ${bodyFont.variable} ${monoFont.variable} bg-parchment-white font-body text-ink-black antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
