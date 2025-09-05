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
              <span className="text-foreground">Tags</span>
            </nav>

            {/* Page Header */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                All Tags
              </h1>
              <p className="text-xl text-muted-foreground">
                Browse articles by topic, technology, or category
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tags Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {tags.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-muted">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">No tags yet</h3>
              <p className="text-muted-foreground">
                Tags will appear here as articles are published.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${encodeURIComponent(tag.name)}`}
                  className="bg-card border border-border rounded-lg p-4 hover:shadow-lg hover:border-primary/50 transition-all duration-200 text-center group"
                >
                  <div className="w-8 h-8 mx-auto mb-3 flex items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors">
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
