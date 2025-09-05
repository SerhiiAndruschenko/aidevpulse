import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  AI
                </span>
              </div>
              <span className="text-xl font-bold text-foreground">
                AIDevPulse
              </span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              AI-powered analysis of the latest tech releases, updates, and
              breaking changes. Daily insights for developers.
            </p>
            <div className="flex space-x-6">
              <a
                href="/rss.xml"
                className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                RSS Feed
              </a>
              <a
                href="/sitemap.xml"
                className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                Sitemap
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/tags"
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  All Tags
                </Link>
              </li>
              <li>
                <a
                  href="/rss.xml"
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  RSS Feed
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © 2024 AIDevPulse. All rights reserved.
            </p>
            <p className="text-muted-foreground text-sm mt-2 md:mt-0">
              Powered by AI
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
