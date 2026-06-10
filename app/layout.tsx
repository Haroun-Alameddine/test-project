import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

/* ----------------------------------------------------------------
   Cairo — primary UI font (covers Arabic + Latin)
   Weight 400 for body, 600 for labels, 700 for headings
   ---------------------------------------------------------------- */
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cairo-next",
  display: "swap",
  preload: true,
});

/* ----------------------------------------------------------------
   Metadata
   ---------------------------------------------------------------- */
export const metadata: Metadata = {
  title: "Pedabook Builder | محرر الكتاب التعليمي",
  description:
    "محرر احترافي لتصميم الكتب التعليمية العربية — Professional Arabic educational book design editor",
  keywords: [
    "محرر كتب",
    "كتاب تعليمي",
    "تصميم كتب عربية",
    "Pedabook",
    "Arabic book editor",
    "educational book builder",
  ],
  authors: [{ name: "Pedabook" }],
  creator: "Pedabook",
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1B3A6B",
};

/* ----------------------------------------------------------------
   Root Layout
   ---------------------------------------------------------------- */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} h-full`}
    >
      <body className="min-h-full antialiased bg-[var(--color-bg)] text-[var(--color-text)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
