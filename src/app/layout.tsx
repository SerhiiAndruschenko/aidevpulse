import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { generateWebsiteStructuredData } from "@/lib/structured-data";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AIDevPulse - AI-Powered Tech Analysis",
  description: "AI-powered analysis of the latest tech releases, updates, and breaking changes. Daily insights for developers.",
  keywords: "ai blog, tech analysis, software releases, breaking changes, developer news, ai content",
  openGraph: {
    title: "AIDevPulse - AI-Powered Tech Analysis",
    description: "AI-powered analysis of the latest tech releases, updates, and breaking changes.",
    url: process.env.SITE_URL || "https://ai-tech-blog.com",
    type: "website",
    siteName: "AIDevPulse",
  },
  twitter: {
    card: "summary_large_image",
    title: "AIDevPulse - AI-Powered Tech Analysis",
    description: "AI-powered analysis of the latest tech releases, updates, and breaking changes.",
  },
  alternates: {
    canonical: process.env.SITE_URL || "https://ai-tech-blog.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = generateWebsiteStructuredData();

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />
        <meta name="apple-mobile-web-app-title" content="AIDevPulse" />
        <meta name="application-name" content="AIDevPulse" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="sitemap" href="/sitemap.xml" />
        <link rel="alternate" type="application/rss+xml" href="/rss.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Navigation />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
