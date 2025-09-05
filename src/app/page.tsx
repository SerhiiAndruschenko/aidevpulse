import type { Metadata } from "next";
import Link from "next/link";
import { Database } from "@/lib/database";

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

async function getRecentArticles() {
  try {
    const articles = await Database.getPublishedArticles(6, 0);
    return articles;
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return [];
  }
}

async function getPopularTags() {
  try {
    const tags = await Database.getAllTags();
    return tags.slice(0, 10);
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return [];
  }
}

export default async function Home() {
  const [articles, tags] = await Promise.all([
    getRecentArticles(),
    getPopularTags()
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              AIDevPulse
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              AI-powered analysis of the latest tech releases, updates, and breaking changes
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="bg-white/20 px-4 py-2 rounded-full text-sm">
                🤖 AI-Generated Content
              </span>
              <span className="bg-white/20 px-4 py-2 rounded-full text-sm">
                📅 Daily Updates
              </span>
              <span className="bg-white/20 px-4 py-2 rounded-full text-sm">
                🔍 Expert Analysis
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Latest Articles</h2>
              
              {articles.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No articles yet</h3>
                  <p className="text-gray-500">Check back soon for AI-generated tech analysis!</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {articles.map((article) => (
                    <article key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      {article.hero_url && (
                        <div className="aspect-video bg-gray-200">
                          <img 
                            src={article.hero_url} 
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {article.author_type === 'ai' ? 'AI Analysis' : 'Human'}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {new Date(article.published_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          <Link href={`/articles/${article.slug}`} className="hover:text-blue-600 transition-colors">
                            {article.title}
                          </Link>
                        </h3>
                        
                        {article.dek && (
                          <p className="text-gray-600 mb-4">{article.dek}</p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{article.word_count} words</span>
                            <span>{article.lang.toUpperCase()}</span>
                          </div>
                          <Link 
                            href={`/articles/${article.slug}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Read More →
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* About */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">About This Blog</h3>
              <p className="text-gray-600 mb-4">
                This blog is powered by AI to analyze the latest tech releases, updates, and breaking changes. 
                Our AI editor processes official release notes and creates insightful analysis for developers.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>AI-generated content</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Daily updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>Expert analysis</span>
                </div>
              </div>
            </div>

            {/* Popular Tags */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.name}`}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm transition-colors"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>

            
          </div>
        </div>
      </div>
    </div>
  );
}