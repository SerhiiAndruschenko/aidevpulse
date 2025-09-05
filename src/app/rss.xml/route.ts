import { Database } from '@/lib/database';

export async function GET() {
  try {
    const articles = await Database.getPublishedArticles(50, 0);
    const baseUrl = process.env.SITE_URL || 'https://ai-tech-blog.com';
    const siteName = process.env.SITE_NAME || 'AIDevPulse';
    const siteDescription = process.env.SITE_DESCRIPTION || 'AI-powered analysis of the latest tech releases, updates, and breaking changes';
    
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteName}</title>
    <description>${siteDescription}</description>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>AIDevPulse</generator>
    ${articles.map(article => `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <description><![CDATA[${article.dek || ''}]]></description>
      <link>${baseUrl}/articles/${article.slug}</link>
      <guid isPermaLink="true">${baseUrl}/articles/${article.slug}</guid>
      <pubDate>${article.published_at.toUTCString()}</pubDate>
      <author>Aiden V. Pulse</author>
      ${article.hero_url ? `<enclosure url="${article.hero_url}" type="image/jpeg" length="0"/>` : ''}
    </item>`).join('')}
  </channel>
</rss>`;

    return new Response(rss, {
      headers: {
        'Content-Type': 'application/rss+xml',
      },
    });
  } catch (error) {
    console.error('Failed to generate RSS feed:', error);
    return new Response('Error generating RSS feed', { status: 500 });
  }
}
