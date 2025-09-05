import type { Metadata } from "next";
import Link from "next/link";
import { Database } from "@/lib/database";
import ArticlesList from "@/components/ArticlesList";

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
    const articles = await Database.getArticles(10, 0);
    const totalCount = await Database.getArticlesCount();
    return { articles, totalCount };
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return { articles: [], totalCount: 0 };
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
  const [articlesData, tags] = await Promise.all([
    getRecentArticles(),
    getPopularTags()
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 dark:from-primary dark:via-primary/95 dark:to-primary/85">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px] dark:bg-grid-white/[0.05]" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
              AIDevPulse
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              AI-powered analysis of the latest tech releases, updates, and breaking changes
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/20 text-white border border-white/30 backdrop-blur-sm hover:bg-white/30 transition-all duration-200">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI-Generated Content
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/20 text-white border border-white/30 backdrop-blur-sm hover:bg-white/30 transition-all duration-200">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Daily Updates
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/20 text-white border border-white/30 backdrop-blur-sm hover:bg-white/30 transition-all duration-200">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Expert Analysis
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
              <h2 className="text-3xl font-bold text-foreground mb-6">Latest Articles</h2>
              <ArticlesList 
                initialArticles={articlesData.articles}
                totalCount={articlesData.totalCount}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* About */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-xl font-semibold text-card-foreground mb-4">About This Blog</h3>
              <p className="text-muted-foreground mb-6">
                This blog is powered by AI to analyze the latest tech releases, updates, and breaking changes. 
                Our AI editor processes official release notes and creates insightful analysis for developers.
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-muted-foreground">AI-generated content</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-muted-foreground">Daily updates</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-muted-foreground">Expert analysis</span>
                </div>
              </div>
            </div>

            {/* Popular Tags */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-xl font-semibold text-card-foreground mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.name}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
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