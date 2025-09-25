import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "ChatConnect - Real-time Chat & Video Calls",
  description:
    "Connect with friends and colleagues through instant messaging, voice calls, and video calls. Built with modern web technologies for seamless communication.",
  keywords: ["chat", "video call", "messaging", "communication", "real-time"],
  authors: [{ name: "ChatConnect Team" }],
  creator: "ChatConnect",
  publisher: "ChatConnect",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://chatconnect.vercel.app"),
  openGraph: {
    title: "ChatConnect - Real-time Chat & Video Calls",
    description: "Connect with friends and colleagues through instant messaging, voice calls, and video calls.",
    url: "https://chatconnect.vercel.app",
    siteName: "ChatConnect",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ChatConnect - Real-time Communication Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ChatConnect - Real-time Chat & Video Calls",
    description: "Connect with friends and colleagues through instant messaging, voice calls, and video calls.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon-192.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.jpg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="light dark" />
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
