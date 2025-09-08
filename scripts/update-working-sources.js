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
  { name: 'Engadget', kind: 'rss', url: 'https://www.engadget.com/rss.xml' },
  { name: 'ZDNet', kind: 'rss', url: 'https://www.zdnet.com/news/rss.xml' },
  { name: 'Slashdot', kind: 'rss', url: 'https://slashdot.org/slashdot.rss' },
  { name: 'TechCrunch', kind: 'rss', url: 'https://techcrunch.com/feed/' },
  { name: 'Mashable', kind: 'rss', url: 'https://mashable.com/feeds/rss/all' },
  { name: 'CNET', kind: 'rss', url: 'https://www.cnet.com/rss/news/' },
  { name: 'Digital Trends', kind: 'rss', url: 'https://www.digitaltrends.com/feed/' },
  { name: 'TechRadar', kind: 'rss', url: 'https://www.techradar.com/rss' },
  { name: 'PCWorld', kind: 'rss', url: 'https://www.pcworld.com/index.rss' },
  { name: 'MakeUseOf', kind: 'rss', url: 'https://www.makeuseof.com/feed/' },
  { name: 'Lifehacker', kind: 'rss', url: 'https://lifehacker.com/rss' },
  { name: 'Fast Company', kind: 'rss', url: 'https://www.fastcompany.com/feed' },
  { name: 'VentureBeat', kind: 'rss', url: 'https://venturebeat.com/feed/' },
  { name: 'The Next Web', kind: 'rss', url: 'https://thenextweb.com/feed/' },
  
  // AI/ML - Verified working RSS feeds
  { name: 'OpenAI Blog', kind: 'rss', url: 'https://openai.com/blog/rss.xml' },
  { name: 'MIT Technology Review AI', kind: 'rss', url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed/' },
  { name: 'Towards Data Science', kind: 'rss', url: 'https://towardsdatascience.com/feed' },
  { name: 'Machine Learning Mastery', kind: 'rss', url: 'https://machinelearningmastery.com/blog/feed/' },
  { name: 'AI Trends', kind: 'rss', url: 'https://www.aitrends.com/feed/' },
  { name: 'KDnuggets', kind: 'rss', url: 'http://www.kdnuggets.com/feed' },
  { name: 'Google AI Blog', kind: 'rss', url: 'https://ai.googleblog.com/feeds/posts/default' },
  { name: 'Microsoft AI Blog', kind: 'rss', url: 'https://blogs.microsoft.com/ai/feed/' },
  { name: 'NVIDIA Developer Blog', kind: 'rss', url: 'https://developer.nvidia.com/blog/feed/' },
  { name: 'TensorFlow Blog', kind: 'rss', url: 'https://blog.tensorflow.org/feeds/posts/default' },
  { name: 'PyTorch Blog', kind: 'rss', url: 'https://pytorch.org/blog/feed.xml' },
  { name: 'Hugging Face Blog', kind: 'rss', url: 'https://huggingface.co/blog/feed.xml' },
  
  // Developer-focused RSS feeds
  { name: 'Dev.to', kind: 'rss', url: 'https://dev.to/feed' },
  { name: 'CSS-Tricks', kind: 'rss', url: 'https://css-tricks.com/feed/' },
  { name: 'Smashing Magazine', kind: 'rss', url: 'https://www.smashingmagazine.com/feed/' },
  { name: 'A List Apart', kind: 'rss', url: 'https://alistapart.com/main/feed/' },
  { name: 'SitePoint', kind: 'rss', url: 'https://www.sitepoint.com/feed/' },
  { name: 'Tuts+', kind: 'rss', url: 'https://tutsplus.com/feed' },
  { name: 'CodePen Blog', kind: 'rss', url: 'https://blog.codepen.io/feed/' },
  { name: 'Stack Overflow Blog', kind: 'rss', url: 'https://stackoverflow.blog/feed/' },
  { name: 'GitHub Blog', kind: 'rss', url: 'https://github.blog/feed/' },
  { name: 'Netlify Blog', kind: 'rss', url: 'https://www.netlify.com/blog/feed/' },
  { name: 'Vercel Blog', kind: 'rss', url: 'https://vercel.com/blog/feed.xml' },
  { name: 'Cloudflare Blog', kind: 'rss', url: 'https://blog.cloudflare.com/rss/' },
  
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
  { name: 'Svelte GitHub', kind: 'github', url: 'sveltejs/svelte' },
  { name: 'Nuxt GitHub', kind: 'github', url: 'nuxt/nuxt' },
  { name: 'SvelteKit GitHub', kind: 'github', url: 'sveltejs/kit' },
  { name: 'Astro GitHub', kind: 'github', url: 'withastro/astro' },
  { name: 'Remix GitHub', kind: 'github', url: 'remix-run/remix' },
  { name: 'Solid GitHub', kind: 'github', url: 'solidjs/solid' },
  { name: 'Qwik GitHub', kind: 'github', url: 'BuilderIO/qwik' },
  { name: 'Webpack GitHub', kind: 'github', url: 'webpack/webpack' },
  { name: 'Rollup GitHub', kind: 'github', url: 'rollup/rollup' },
  { name: 'ESBuild GitHub', kind: 'github', url: 'evanw/esbuild' },
  { name: 'SWC GitHub', kind: 'github', url: 'swc-project/swc' },
  { name: 'Turbopack GitHub', kind: 'github', url: 'vercel/turbo' },
  { name: 'Rust GitHub', kind: 'github', url: 'rust-lang/rust' },
  { name: 'Go GitHub', kind: 'github', url: 'golang/go' },
  { name: 'Python GitHub', kind: 'github', url: 'python/cpython' },
  { name: 'Docker GitHub', kind: 'github', url: 'docker/docker' },
  { name: 'Kubernetes GitHub', kind: 'github', url: 'kubernetes/kubernetes' },
  { name: 'Terraform GitHub', kind: 'github', url: 'hashicorp/terraform' },
  { name: 'PostgreSQL GitHub', kind: 'github', url: 'postgres/postgres' },
  { name: 'MongoDB GitHub', kind: 'github', url: 'mongodb/mongo' },
  { name: 'Redis GitHub', kind: 'github', url: 'redis/redis' },
  { name: 'Elasticsearch GitHub', kind: 'github', url: 'elastic/elasticsearch' },
  { name: 'Apache Kafka GitHub', kind: 'github', url: 'apache/kafka' },
  { name: 'Apache Spark GitHub', kind: 'github', url: 'apache/spark' },
  { name: 'TensorFlow GitHub', kind: 'github', url: 'tensorflow/tensorflow' },
  { name: 'PyTorch GitHub', kind: 'github', url: 'pytorch/pytorch' },
  { name: 'Hugging Face Transformers GitHub', kind: 'github', url: 'huggingface/transformers' },
  { name: 'OpenAI GitHub', kind: 'github', url: 'openai/openai-python' },
  { name: 'LangChain GitHub', kind: 'github', url: 'langchain-ai/langchain' },
  { name: 'LlamaIndex GitHub', kind: 'github', url: 'run-llama/llama_index' },
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
