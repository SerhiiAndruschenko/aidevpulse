import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Database } from "@/lib/database";
import { formatArticleDate, formatShortDate } from "@/lib/date-utils";

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getArticle(slug: string) {
  try {
    const article = await Database.getArticleBySlug(slug);
    if (!article) return null;

    const [citations, tags] = await Promise.all([
      Database.getCitationsByArticleId(article.id),
      Database.getTagsByArticleId(article.id),
    ]);

    return {
      ...article,
      citations,
      tags,
    };
  } catch (error) {
    console.error("Failed to fetch article:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: "Article Not Found",
    };
  }

  return {
    title: `${article.title} | AIDevPulse`,
    description: article.dek || `AI-generated analysis of ${article.title}`,
    openGraph: {
      title: article.title,
      description: article.dek || `AI-generated analysis of ${article.title}`,
      url: `${process.env.SITE_URL}/articles/${article.slug}`,
      type: "article",
      publishedTime: article.published_at.toISOString(),
      authors: ["Aiden Pulse"],
      images: article.hero_url ? [article.hero_url] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.dek || `AI-generated analysis of ${article.title}`,
      images: article.hero_url ? [article.hero_url] : undefined,
    },
    alternates: {
      canonical: `${process.env.SITE_URL}/articles/${article.slug}`,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Article Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-6">
              <Link
                href="/"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Home
              </Link>
              <span className="mx-2 text-muted-foreground">/</span>
              <span className="text-muted-foreground">Articles</span>
              <span className="mx-2 text-muted-foreground">/</span>
              <span className="text-foreground">{article.slug}</span>
            </nav>

            {/* Article Meta */}
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
                {article.author_type === "ai" ? "Aiden Pulse" : "Human"}
              </span>
              <span className="text-muted-foreground text-sm">
                {formatArticleDate(article.published_at)}
              </span>
              <span className="text-muted-foreground text-sm">
                {article.word_count} words
              </span>
            </div>

            {/* Article Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {article.title}
            </h1>

            {/* Article Subtitle */}
            {article.dek && (
              <p className="text-xl text-muted-foreground mb-8">
                {article.dek}
              </p>
            )}

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {article.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.name}`}
                    className="bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground px-3 py-1 rounded-full text-sm transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Hero Image */}
            {article.hero_url && (
              <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-8">
                <img
                  src={article.hero_url}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <article className="prose prose-lg max-w-none text-foreground">
                <div
                  dangerouslySetInnerHTML={{ __html: article.body_html }}
                  className="article-content [&_.summary]:text-lg [&_.summary]:text-muted-foreground [&_.summary]:mb-8 [&_section]:mb-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mb-4 [&_ul]:space-y-2 [&_li]:text-foreground [&_.code-block]:bg-muted [&_.code-block]:p-4 [&_.code-block]:rounded-lg [&_.code-block]:overflow-x-auto [&_pre]:text-sm [&_code]:font-mono [&_.breaking-changes]:bg-red-50 [&_.breaking-changes]:dark:bg-red-950/20 [&_.breaking-changes]:border [&_.breaking-changes]:border-red-200 [&_.breaking-changes]:dark:border-red-800 [&_.breaking-changes]:rounded-lg [&_.breaking-changes]:p-4 [&_.warning]:bg-yellow-50 [&_.warning]:dark:bg-yellow-950/20 [&_.warning]:border [&_.warning]:border-yellow-200 [&_.warning]:dark:border-yellow-800 [&_.warning]:rounded-lg [&_.warning]:p-4 [&_.disclaimer]:text-sm [&_.disclaimer]:text-muted-foreground [&_.disclaimer]:italic [&_.disclaimer]:mt-8"
                />
              </article>

              {/* Citations */}
              {article.citations.length > 0 && (
                <div className="mt-12 bg-muted/50 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    Sources
                  </h3>
                  <ul className="space-y-2">
                    {article.citations.map((citation) => (
                      <li key={citation.id}>
                        <a
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 underline transition-colors"
                        >
                          {citation.title || citation.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Disclaimer */}
              <div className="mt-8 p-4 bg-primary/10 border-l-4 border-primary rounded">
                <p className="text-sm text-primary">
                  <strong>Disclaimer:</strong> This analysis was generated by AI
                  based on official release notes and documentation. While we
                  strive for accuracy, please verify important information with
                  official sources.
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Article Info */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-bold text-card-foreground mb-4">
                    Article Info
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Author:</span>
                      <span className="font-medium text-card-foreground">
                        Aiden Pulse
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Published:</span>
                      <span className="font-medium text-card-foreground">
                        {formatShortDate(article.published_at)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Words:</span>
                      <span className="font-medium text-card-foreground">
                        {article.word_count}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Language:</span>
                      <span className="font-medium text-card-foreground">
                        {article.lang.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span
                        className={`font-medium ${
                          article.review_status === "reviewed"
                            ? "text-green-600 dark:text-green-400"
                            : article.review_status === "needs_review"
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-primary"
                        }`}
                      >
                        {article.review_status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Related Tags */}
                {article.tags.length > 0 && (
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-lg font-bold text-card-foreground mb-4">
                      Related Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag) => (
                        <Link
                          key={tag.id}
                          href={`/tags/${tag.name}`}
                          className="bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground px-2 py-1 rounded text-sm transition-colors"
                        >
                          {tag.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Back to Blog */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <Link
                    href="/"
                    className="flex items-center text-primary hover:text-primary/80 transition-colors"
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
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Back to Blog
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
