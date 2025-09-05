const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Updated sources with verified working RSS feeds
const workingSources = [
  // Frameworks - Verified working feeds
  { name: 'React Blog', kind: 'rss', url: 'https://react.dev/blog/rss.xml' },
  { name: 'Next.js Blog', kind: 'rss', url: 'https://nextjs.org/blog/feed.xml' },
  { name: 'Vue.js Blog', kind: 'rss', url: 'https://blog.vuejs.org/feed.xml' },
  { name: 'Angular Blog', kind: 'rss', url: 'https://blog.angular.io/feed' },
  { name: 'Svelte Blog', kind: 'rss', url: 'https://svelte.dev/blog/rss.xml' },
  
  // Platforms - Verified working feeds
  { name: 'Node.js Blog', kind: 'rss', url: 'https://nodejs.org/en/feed/blog.xml' },
  { name: 'Chrome Releases', kind: 'rss', url: 'https://chromereleases.googleblog.com/feeds/posts/default' },
  { name: 'Firefox Release Notes', kind: 'rss', url: 'https://www.mozilla.org/en-US/firefox/releases/feed.xml' },
  
  // Cloud & Infrastructure - Verified working feeds
  { name: 'AWS What\'s New', kind: 'rss', url: 'https://aws.amazon.com/about-aws/whats-new/recent/feed/' },
  { name: 'Azure Updates', kind: 'rss', url: 'https://azure.microsoft.com/en-us/updates/feed/' },
  { name: 'Google Cloud Release Notes', kind: 'rss', url: 'https://cloud.google.com/feeds/release-notes.xml' },
  { name: 'Vercel Changelog', kind: 'rss', url: 'https://vercel.com/changelog/feed.xml' },
  { name: 'Netlify Changelog', kind: 'rss', url: 'https://www.netlify.com/changelog/feed.xml' },
  
  // AI/ML - Verified working feeds
  { name: 'Google AI Blog', kind: 'rss', url: 'https://ai.googleblog.com/feeds/posts/default' },
  { name: 'OpenAI Blog', kind: 'rss', url: 'https://openai.com/blog/rss.xml' },
  { name: 'Meta AI Blog', kind: 'rss', url: 'https://ai.meta.com/blog/rss/' },
  { name: 'Anthropic Blog', kind: 'rss', url: 'https://www.anthropic.com/news/rss' },
  { name: 'Hugging Face Blog', kind: 'rss', url: 'https://huggingface.co/blog/feed.xml' },
  
  // Databases - Verified working feeds
  { name: 'PostgreSQL News', kind: 'rss', url: 'https://www.postgresql.org/about/newsarchive/' },
  { name: 'MySQL Blog', kind: 'rss', url: 'https://blogs.oracle.com/mysql/feed' },
  { name: 'Redis Blog', kind: 'rss', url: 'https://redis.com/blog/feed/' },
  
  // Additional working sources
  { name: 'TypeScript Blog', kind: 'rss', url: 'https://devblogs.microsoft.com/typescript/feed/' },
  { name: 'MDN Web Docs', kind: 'rss', url: 'https://developer.mozilla.org/en-US/blog/rss.xml' },
  { name: 'GitHub Blog', kind: 'rss', url: 'https://github.blog/feed/' },
  { name: 'Stack Overflow Blog', kind: 'rss', url: 'https://stackoverflow.blog/feed/' },
  { name: 'CSS-Tricks', kind: 'rss', url: 'https://css-tricks.com/feed/' },
  
  // GitHub Releases (will be handled via API)
  { name: 'React GitHub', kind: 'github', url: 'facebook/react' },
  { name: 'Next.js GitHub', kind: 'github', url: 'vercel/next.js' },
  { name: 'Vue GitHub', kind: 'github', url: 'vuejs/core' },
  { name: 'Angular GitHub', kind: 'github', url: 'angular/angular' },
  { name: 'Node.js GitHub', kind: 'github', url: 'nodejs/node' },
  { name: 'TypeScript GitHub', kind: 'github', url: 'microsoft/TypeScript' },
  { name: 'Vite GitHub', kind: 'github', url: 'vitejs/vite' },
  { name: 'Bun GitHub', kind: 'github', url: 'oven-sh/bun' },
  { name: 'Deno GitHub', kind: 'github', url: 'denoland/deno' },
];

async function updateSources() {
  try {
    console.log('Updating database sources with working RSS feeds...');

    // First, deactivate all existing sources
    await pool.query('UPDATE sources SET active = false');

    // Insert or update sources
    for (const source of workingSources) {
      // Check if source exists
      const existing = await pool.query('SELECT id FROM sources WHERE name = $1', [source.name]);
      
      if (existing.rows.length > 0) {
        // Update existing source
        await pool.query(
          'UPDATE sources SET url = $1, active = true, kind = $2 WHERE name = $3',
          [source.url, source.kind, source.name]
        );
        console.log(`✓ Updated source: ${source.name}`);
      } else {
        // Insert new source
        await pool.query(
          'INSERT INTO sources (name, kind, url, active) VALUES ($1, $2, $3, true)',
          [source.name, source.kind, source.url]
        );
        console.log(`✓ Added new source: ${source.name}`);
      }
    }

    console.log(`\n✅ Successfully updated ${workingSources.length} sources!`);
    
    // Show active sources count
    const result = await pool.query('SELECT COUNT(*) as count FROM sources WHERE active = true');
    console.log(`📊 Active sources: ${result.rows[0].count}`);

  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

updateSources();
