import { Article, Citation, Tag } from './database';

export interface StructuredDataArticle {
  '@context': string;
  '@type': string;
  headline: string;
  description?: string;
  image?: string;
  datePublished: string;
  dateModified: string;
  author: {
    '@type': string;
    name: string;
  };
  publisher: {
    '@type': string;
    name: string;
    logo: {
      '@type': string;
      url: string;
    };
  };
  mainEntityOfPage: {
    '@type': string;
    '@id': string;
  };
  wordCount?: number;
  inLanguage: string;
  isAccessibleForFree: boolean;
  articleSection?: string;
  keywords?: string;
}

export function generateArticleStructuredData(
  article: Article,
  citations: Citation[],
  tags: Tag[]
): StructuredDataArticle {
  const baseUrl = process.env.SITE_URL || 'https://ai-tech-blog.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.dek || `AI-generated analysis of ${article.title}`,
    image: article.hero_url ? `${baseUrl}${article.hero_url}` : undefined,
    datePublished: article.published_at.toISOString(),
    dateModified: article.published_at.toISOString(),
    author: {
      '@type': 'Person',
      name: article.author_type === 'ai' ? 'AI Editor' : 'Human Editor'
    },
    publisher: {
      '@type': 'Organization',
      name: process.env.SITE_NAME || 'AIDevPulse',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/articles/${article.slug}`
    },
    wordCount: article.word_count,
    inLanguage: article.lang,
    isAccessibleForFree: true,
    articleSection: tags.length > 0 ? tags[0].name : undefined,
    keywords: tags.map(tag => tag.name).join(', ')
  };
}

export function generateWebsiteStructuredData() {
  const baseUrl = process.env.SITE_URL || 'https://ai-tech-blog.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: process.env.SITE_NAME || 'AIDevPulse',
    description: process.env.SITE_DESCRIPTION || 'AI-powered analysis of the latest tech releases, updates, and breaking changes',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

export function generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }))
  };
}
