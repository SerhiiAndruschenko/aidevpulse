import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Database } from "@/lib/database";
import ArticlesList from "@/components/ArticlesList";

interface TagPageProps {
  params: Promise<{
    name: string;
  }>;
}

async function getTagArticles(tagName: string) {
  try {
    const articles = await Database.getArticlesByTag(tagName, 10, 0);
    const totalCount = await Database.getArticlesCountByTag(tagName);
    return { articles, totalCount };
  } catch (error) {
    console.error('Failed to fetch tag articles:', error);
    return { articles: [], totalCount: 0 };
  }
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { name } = await params;
  const tagName = decodeURIComponent(name);
  const articlesData = await getTagArticles(tagName);
  
  return {
    title: `Articles tagged with "${tagName}" | AIDevPulse`,
    description: `Browse all articles tagged with ${tagName} on AIDevPulse. AI-generated analysis of tech releases and updates.`,
    openGraph: {
      title: `Articles tagged with "${tagName}"`,
      description: `Browse all articles tagged with ${tagName} on AIDevPulse.`,
      url: `${process.env.SITE_URL}/tags/${encodeURIComponent(tagName)}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `Articles tagged with "${tagName}"`,
      description: `Browse all articles tagged with ${tagName} on AIDevPulse.`,
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { name } = await params;
  const tagName = decodeURIComponent(name);
  const articlesData = await getTagArticles(tagName);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-6">
              <Link href="/" className="text-primary hover:text-primary/80 transition-colors">
                Home
              </Link>
              <span className="mx-2 text-muted-foreground">/</span>
              <Link href="/tags" className="text-primary hover:text-primary/80 transition-colors">
                Tags
              </Link>
              <span className="mx-2 text-muted-foreground">/</span>
              <span className="text-foreground">{tagName}</span>
            </nav>

            {/* Tag Header */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                #{tagName}
              </h1>
              <p className="text-xl text-muted-foreground">
                {articlesData.totalCount} article{articlesData.totalCount !== 1 ? 's' : ''} tagged with "{tagName}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Articles */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <ArticlesList 
            initialArticles={articlesData.articles}
            totalCount={articlesData.totalCount}
            baseUrl={tagName}
          />
        </div>
      </div>
    </div>
  );
}
