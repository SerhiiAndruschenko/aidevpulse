const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const sources = [
  // Frameworks
  { name: 'React Blog', kind: 'rss', url: 'https://react.dev/blog/rss.xml' },
  { name: 'Next.js Blog', kind: 'rss', url: 'https://nextjs.org/blog/feed.xml' },
  { name: 'Vue.js Blog', kind: 'rss', url: 'https://blog.vuejs.org/feed.xml' },
  { name: 'Angular Blog', kind: 'rss', url: 'https://blog.angular.io/feed' },
  { name: 'Svelte Blog', kind: 'rss', url: 'https://svelte.dev/blog/rss.xml' },
  
  // Platforms
  { name: 'Node.js Blog', kind: 'rss', url: 'https://nodejs.org/en/feed/blog.xml' },
  { name: 'Chrome Releases', kind: 'rss', url: 'https://chromereleases.googleblog.com/feeds/posts/default' },
  { name: 'Firefox Release Notes', kind: 'rss', url: 'https://www.mozilla.org/en-US/firefox/releases/feed.xml' },
  
  // Cloud & Infrastructure
  { name: 'AWS What\'s New', kind: 'rss', url: 'https://aws.amazon.com/about-aws/whats-new/recent/feed/' },
  { name: 'Azure Updates', kind: 'rss', url: 'https://azure.microsoft.com/en-us/updates/feed/' },
  { name: 'Google Cloud Release Notes', kind: 'rss', url: 'https://cloud.google.com/feeds/release-notes.xml' },
  { name: 'Vercel Changelog', kind: 'rss', url: 'https://vercel.com/changelog/feed.xml' },
  { name: 'Netlify Changelog', kind: 'rss', url: 'https://www.netlify.com/changelog/feed.xml' },
  
  // AI/ML
  { name: 'Google AI Blog', kind: 'rss', url: 'https://ai.googleblog.com/feeds/posts/default' },
  { name: 'OpenAI Blog', kind: 'rss', url: 'https://openai.com/blog/rss.xml' },
  { name: 'Meta AI Blog', kind: 'rss', url: 'https://ai.meta.com/blog/rss/' },
  { name: 'Anthropic Blog', kind: 'rss', url: 'https://www.anthropic.com/news/rss' },
  { name: 'Hugging Face Blog', kind: 'rss', url: 'https://huggingface.co/blog/feed.xml' },
  
  // Databases
  { name: 'PostgreSQL News', kind: 'rss', url: 'https://www.postgresql.org/about/newsarchive/' },
  { name: 'MySQL Blog', kind: 'rss', url: 'https://blogs.oracle.com/mysql/feed' },
  { name: 'Redis Blog', kind: 'rss', url: 'https://redis.com/blog/feed/' },
  
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

async function seed() {
  try {
    console.log('Seeding database with sources...');

    for (const source of sources) {
      await pool.query(
        'INSERT INTO sources (name, kind, url) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [source.name, source.kind, source.url]
      );
    }

    // Add some initial tags
    const tags = [
      'react', 'nextjs', 'vue', 'angular', 'svelte', 'nodejs', 'typescript',
      'javascript', 'web-development', 'frontend', 'backend', 'ai', 'ml',
      'cloud', 'aws', 'azure', 'gcp', 'database', 'postgresql', 'mysql',
      'redis', 'release', 'update', 'framework', 'library', 'tool'
    ];

    for (const tag of tags) {
      await pool.query(
        'INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [tag]
      );
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
