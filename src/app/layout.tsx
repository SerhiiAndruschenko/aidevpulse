import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { generateWebsiteStructuredData } from "@/lib/structured-data";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getThemeFromCookies } from "@/lib/theme-detector";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

import { GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = generateWebsiteStructuredData();
  const initialTheme = await getThemeFromCookies();

  return (
    <html lang="en" className={initialTheme} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  const initialTheme = theme || systemTheme;
                  
                  // Set theme class immediately - this must be first!
                  if (initialTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  
                  // Set data attribute for CSS
                  document.documentElement.setAttribute('data-theme', initialTheme);
                  
                  // Also set color-scheme for immediate browser styling
                  document.documentElement.style.colorScheme = initialTheme;
                } catch (e) {
                  // Fallback to light mode if localStorage is not available
                  document.documentElement.classList.remove('dark');
                  document.documentElement.setAttribute('data-theme', 'light');
                  document.documentElement.style.colorScheme = 'light';
                }
              })();
            `,
          }}
        />
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
        <GoogleAnalytics gaId="G-126FME87T3" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider initialTheme={initialTheme}>
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
