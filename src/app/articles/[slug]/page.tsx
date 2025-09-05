import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Database } from "@/lib/database";

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
      Database.getTagsByArticleId(article.id)
    ]);

    return {
      ...article,
      citations,
      tags
    };
  } catch (error) {
    console.error('Failed to fetch article:', error);
    return null;
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  
  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: `${article.title} | AIDevPulse`,
    description: article.dek || `AI-generated analysis of ${article.title}`,
    openGraph: {
      title: article.title,
      description: article.dek || `AI-generated analysis of ${article.title}`,
      url: `${process.env.SITE_URL}/articles/${article.slug}`,
      type: 'article',
      publishedTime: article.published_at.toISOString(),
      authors: ['Aiden V. Pulse'],
      images: article.hero_url ? [article.hero_url] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
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
    <div className="min-h-screen bg-gray-50">
      {/* Article Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-6">
              <Link href="/" className="text-blue-600 hover:text-blue-800">
                Home
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-600">Articles</span>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-900">{article.slug}</span>
            </nav>

            {/* Article Meta */}
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                {article.author_type === 'ai' ? 'AI Analysis' : 'Human'}
              </span>
              <span className="text-gray-500 text-sm">
                {new Date(article.published_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className="text-gray-500 text-sm">
                {article.word_count} words
              </span>
              <span className="text-gray-500 text-sm">
                {article.lang.toUpperCase()}
              </span>
            </div>

            {/* Article Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>

            {/* Article Subtitle */}
            {article.dek && (
              <p className="text-xl text-gray-600 mb-8">
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
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Hero Image */}
            {article.hero_url && (
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-8">
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
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <article className="prose prose-lg max-w-none">
                <div 
                  dangerouslySetInnerHTML={{ __html: article.body_html }}
                  className="article-content"
                />
              </article>

              {/* Citations */}
              {article.citations.length > 0 && (
                <div className="mt-12 bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Sources</h3>
                  <ul className="space-y-2">
                    {article.citations.map((citation) => (
                      <li key={citation.id}>
                        <a 
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {citation.title || citation.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Disclaimer */}
              <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Disclaimer:</strong> This analysis was generated by AI based on official release notes and documentation. 
                  While we strive for accuracy, please verify important information with official sources.
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Article Info */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Article Info</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Author:</span>
                      <span className="font-medium">Aiden V. Pulse</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Published:</span>
                      <span className="font-medium">
                        {new Date(article.published_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Words:</span>
                      <span className="font-medium">{article.word_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Language:</span>
                      <span className="font-medium">{article.lang.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${
                        article.review_status === 'reviewed' ? 'text-green-600' :
                        article.review_status === 'needs_review' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`}>
                        {article.review_status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Related Tags */}
                {article.tags.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Related Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag) => (
                        <Link
                          key={tag.id}
                          href={`/tags/${tag.name}`}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm transition-colors"
                        >
                          {tag.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Back to Blog */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <Link 
                    href="/"
                    className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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
