import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Database } from "@/lib/database";

interface TagPageProps {
  params: Promise<{
    name: string;
  }>;
}

async function getTagArticles(tagName: string) {
  try {
    const articles = await Database.getArticlesByTag(tagName, 20, 0);
    return articles;
  } catch (error) {
    console.error('Failed to fetch tag articles:', error);
    return [];
  }
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { name } = await params;
  const tagName = decodeURIComponent(name);
  const articles = await getTagArticles(tagName);
  
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
  const articles = await getTagArticles(tagName);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-6">
              <Link href="/" className="text-blue-600 hover:text-blue-800">
                Home
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <Link href="/tags" className="text-blue-600 hover:text-blue-800">
                Tags
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-900">{tagName}</span>
            </nav>

            {/* Tag Header */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                #{tagName}
              </h1>
              <p className="text-xl text-gray-600">
                {articles.length} article{articles.length !== 1 ? 's' : ''} tagged with "{tagName}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Articles */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏷️</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No articles found</h3>
              <p className="text-gray-500 mb-6">
                No articles are currently tagged with "{tagName}".
              </p>
              <Link 
                href="/"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse All Articles
              </Link>
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
                    
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      <Link href={`/articles/${article.slug}`} className="hover:text-blue-600 transition-colors">
                        {article.title}
                      </Link>
                    </h2>
                    
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
    </div>
  );
}
