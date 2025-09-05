import type { Metadata } from "next";
import Link from "next/link";
import { Database } from "@/lib/database";

export const metadata: Metadata = {
  title: "All Tags | AIDevPulse",
  description: "Browse all tags on AIDevPulse. Find articles by topic, technology, or category.",
  openGraph: {
    title: "All Tags | AIDevPulse",
    description: "Browse all tags on AIDevPulse. Find articles by topic, technology, or category.",
    url: `${process.env.SITE_URL}/tags`,
    type: 'website',
  },
};

async function getAllTags() {
  try {
    const tags = await Database.getAllTags();
    return tags;
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return [];
  }
}

export default async function TagsPage() {
  const tags = await getAllTags();

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
              <span className="text-gray-900">Tags</span>
            </nav>

            {/* Page Header */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                All Tags
              </h1>
              <p className="text-xl text-gray-600">
                Browse articles by topic, technology, or category
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tags Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {tags.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏷️</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No tags yet</h3>
              <p className="text-gray-500">
                Tags will appear here as articles are published.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${encodeURIComponent(tag.name)}`}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center group"
                >
                  <div className="text-2xl mb-2">🏷️</div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    #{tag.name}
                  </h3>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
