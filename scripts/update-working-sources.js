const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Curated list of working RSS feeds and GitHub repos
const workingSources = [
  // Tech News - Verified working RSS feeds
  { name: 'The Verge', kind: 'rss', url: 'https://www.theverge.com/rss/index.xml' },
  { name: 'Wired', kind: 'rss', url: 'https://www.wired.com/feed/rss' },
  { name: 'Ars Technica', kind: 'rss', url: 'https://arstechnica.com/feed/' },
  { name: 'Gizmodo', kind: 'rss', url: 'https://gizmodo.com/rss' },
  { name: 'Mashable', kind: 'rss', url: 'https://mashable.com/feeds/all.xml' },
  { name: 'Engadget', kind: 'rss', url: 'https://www.engadget.com/rss.xml' },
  { name: 'ZDNet', kind: 'rss', url: 'https://www.zdnet.com/news/rss.xml' },
  { name: 'Slashdot', kind: 'rss', url: 'https://slashdot.org/slashdot.rss' },
  
  // AI/ML - Verified working RSS feeds
  { name: 'OpenAI Blog', kind: 'rss', url: 'https://openai.com/blog/rss.xml' },
  { name: 'MIT Technology Review AI', kind: 'rss', url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed/' },
  { name: 'Towards Data Science', kind: 'rss', url: 'https://towardsdatascience.com/feed' },
  { name: 'Machine Learning Mastery', kind: 'rss', url: 'https://machinelearningmastery.com/blog/feed/' },
  { name: 'AI Trends', kind: 'rss', url: 'https://www.aitrends.com/feed/' },
  { name: 'KDnuggets', kind: 'rss', url: 'http://www.kdnuggets.com/feed' },
  
  // GitHub Releases - High activity repos
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

async function updateWorkingSources() {
  try {
    console.log('🔄 Updating database with working RSS feeds and GitHub repos...');

    // First, deactivate all existing sources
    await pool.query('UPDATE sources SET active = false');
    console.log('✅ Deactivated all existing sources');

    // Insert or update working sources
    for (const source of workingSources) {
      // Check if source exists
      const existing = await pool.query('SELECT id FROM sources WHERE name = $1', [source.name]);
      
      if (existing.rows.length > 0) {
        // Update existing source
        await pool.query(
          'UPDATE sources SET url = $1, active = true, kind = $2 WHERE name = $3',
          [source.url, source.kind, source.name]
        );
        console.log(`✅ Updated source: ${source.name}`);
      } else {
        // Insert new source
        await pool.query(
          'INSERT INTO sources (name, kind, url, active) VALUES ($1, $2, $3, true)',
          [source.name, source.kind, source.url]
        );
        console.log(`✅ Added new source: ${source.name}`);
      }
    }

    console.log(`\n🎉 Successfully updated ${workingSources.length} working sources!`);
    
    // Show active sources count
    const result = await pool.query('SELECT COUNT(*) as count FROM sources WHERE active = true');
    console.log(`📊 Active sources: ${result.rows[0].count}`);

    // Show breakdown by type
    const breakdown = await pool.query(`
      SELECT kind, COUNT(*) as count 
      FROM sources 
      WHERE active = true 
      GROUP BY kind 
      ORDER BY count DESC
    `);
    
    console.log('\n📈 Sources breakdown:');
    breakdown.rows.forEach(row => {
      console.log(`  ${row.kind}: ${row.count} sources`);
    });

  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

updateWorkingSources();
