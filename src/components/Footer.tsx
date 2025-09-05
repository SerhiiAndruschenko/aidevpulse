import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-bold">AIDevPulse</span>
            </div>
            <p className="text-gray-400 mb-4">
              AI-powered analysis of the latest tech releases, updates, and breaking changes. 
              Daily insights for developers.
            </p>
            <div className="flex space-x-4">
              <a href="/rss.xml" className="text-gray-400 hover:text-white transition-colors">
                RSS Feed
              </a>
              <a href="/sitemap.xml" className="text-gray-400 hover:text-white transition-colors">
                Sitemap
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/tags" className="text-gray-400 hover:text-white transition-colors">
                  All Tags
                </Link>
              </li>
              <li>
                <a href="/rss.xml" className="text-gray-400 hover:text-white transition-colors">
                  RSS Feed
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 AIDevPulse. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}