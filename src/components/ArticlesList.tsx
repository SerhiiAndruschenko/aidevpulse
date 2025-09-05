'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatShortDate } from '@/lib/date-utils';

interface Article {
  id: number;
  slug: string;
  title: string;
  dek?: string;
  hero_url?: string;
  author_type: 'ai' | 'human';
  published_at: Date | string;
  word_count?: number;
  lang: string;
}

interface ArticlesListProps {
  initialArticles: Article[];
  totalCount: number;
  baseUrl?: string; // For tag pages
}

export default function ArticlesList({ initialArticles, totalCount, baseUrl = '' }: ArticlesListProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(Math.ceil(totalCount / 10));

  const fetchArticles = async (page: number) => {
    setLoading(true);
    try {
      const url = baseUrl 
        ? `/api/articles?page=${page}&limit=10&tag=${encodeURIComponent(baseUrl)}`
        : `/api/articles?page=${page}&limit=10`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles);
        setTotalPages(Math.ceil(data.totalCount / 10));
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchArticles(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-muted-foreground bg-background border border-border rounded-l-lg hover:bg-muted hover:text-foreground transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>
      );
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm font-medium border-t border-b transition-colors ${
            i === currentPage
              ? 'text-primary-foreground bg-primary border-primary'
              : 'text-muted-foreground bg-background border-border hover:bg-muted hover:text-foreground'
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-muted-foreground bg-background border border-border rounded-r-lg hover:bg-muted hover:text-foreground transition-colors"
        >
          Next
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center mt-8">
        <nav className="flex" aria-label="Pagination">
          {pages}
        </nav>
      </div>
    );
  };

  if (articles.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No articles yet</h3>
        <p className="text-muted-foreground">Check back soon for AI-generated tech analysis!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Articles List */}
      <div className="space-y-6">
        {articles.map((article) => (
          <article key={article.id} className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/20">
            {article.hero_url && (
              <div className="aspect-video bg-muted overflow-hidden">
                <img 
                  src={article.hero_url} 
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {article.author_type === 'ai' ? 'Aiden Pulse' : 'Human'}
                </span>
                <span className="text-muted-foreground text-sm">
                  {formatShortDate(article.published_at)}
                </span>
              </div>
              
              <h3 className="text-xl font-semibold text-card-foreground mb-3 group-hover:text-primary transition-colors">
                <Link href={`/articles/${article.slug}`} className="hover:underline">
                  {article.title}
                </Link>
              </h3>
              
              {article.dek && (
                <p className="text-muted-foreground mb-4 line-clamp-2">{article.dek}</p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{article.word_count} words</span>
                  <span className="px-2 py-1 bg-muted rounded-md text-xs font-medium">{article.lang.toUpperCase()}</span>
                </div>
                <Link 
                  href={`/articles/${article.slug}`}
                  className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                >
                  Read More
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
        </div>
      )}

      {/* Pagination */}
      {renderPagination()}

      {/* Page info */}
      {totalPages > 1 && (
        <div className="text-center mt-6 text-sm text-muted-foreground">
          Page {currentPage} of {totalPages} ({totalCount} total articles)
        </div>
      )}
    </div>
  );
}
