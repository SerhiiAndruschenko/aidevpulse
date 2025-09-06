const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function diagnoseCronIssues() {
  console.log('🔍 Diagnosing cron job issues...\n');

  try {
    // 1. Check environment variables
    console.log('1. Checking environment variables:');
    const requiredEnvVars = ['DATABASE_URL', 'GEMINI_API_KEY'];
    const optionalEnvVars = ['CRON_SECRET', 'IMAGE_API_KEY', 'SITE_URL'];
    
    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        console.log(`   ✅ ${envVar}: Set`);
      } else {
        console.log(`   ❌ ${envVar}: Missing (REQUIRED)`);
      }
    }
    
    for (const envVar of optionalEnvVars) {
      if (process.env[envVar]) {
        console.log(`   ✅ ${envVar}: Set`);
      } else {
        console.log(`   ⚠️  ${envVar}: Not set (optional)`);
      }
    }

    // 2. Test database connection
    console.log('\n2. Testing database connection:');
    try {
      const result = await pool.query('SELECT NOW() as current_time');
      console.log(`   ✅ Database connected: ${result.rows[0].current_time}`);
    } catch (error) {
      console.log(`   ❌ Database connection failed: ${error.message}`);
      return;
    }

    // 3. Check if tables exist
    console.log('\n3. Checking database tables:');
    const tables = ['sources', 'items_raw', 'articles', 'citations', 'tags', 'article_tags'];
    
    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`   ✅ ${table}: ${result.rows[0].count} records`);
      } catch (error) {
        console.log(`   ❌ ${table}: Table missing or error - ${error.message}`);
      }
    }

    // 4. Check active sources
    console.log('\n4. Checking data sources:');
    try {
      const sources = await pool.query('SELECT name, kind, url, active FROM sources ORDER BY name');
      console.log(`   📊 Total sources: ${sources.rows.length}`);
      
      const activeSources = sources.rows.filter(s => s.active);
      console.log(`   ✅ Active sources: ${activeSources.length}`);
      
      if (activeSources.length === 0) {
        console.log('   ⚠️  No active sources found! This will prevent article generation.');
      } else {
        console.log('   Active sources:');
        activeSources.forEach(source => {
          console.log(`     - ${source.name} (${source.kind}): ${source.url}`);
        });
      }
    } catch (error) {
      console.log(`   ❌ Error checking sources: ${error.message}`);
    }

    // 5. Check recent raw items
    console.log('\n5. Checking recent data ingestion:');
    try {
      const recentItems = await pool.query(`
        SELECT COUNT(*) as count, MAX(created_at) as latest 
        FROM items_raw 
        WHERE created_at > NOW() - INTERVAL '7 days'
      `);
      
      const count = recentItems.rows[0].count;
      const latest = recentItems.rows[0].latest;
      
      if (count > 0) {
        console.log(`   ✅ Recent items: ${count} in last 7 days`);
        console.log(`   📅 Latest item: ${latest}`);
      } else {
        console.log('   ⚠️  No items ingested in the last 7 days');
      }
    } catch (error) {
      console.log(`   ❌ Error checking recent items: ${error.message}`);
    }

    // 6. Check recent articles
    console.log('\n6. Checking recent articles:');
    try {
      const recentArticles = await pool.query(`
        SELECT COUNT(*) as count, MAX(published_at) as latest 
        FROM articles 
        WHERE published_at > NOW() - INTERVAL '7 days'
      `);
      
      const count = recentArticles.rows[0].count;
      const latest = recentArticles.rows[0].latest;
      
      if (count > 0) {
        console.log(`   ✅ Recent articles: ${count} in last 7 days`);
        console.log(`   📅 Latest article: ${latest}`);
      } else {
        console.log('   ⚠️  No articles generated in the last 7 days');
      }
    } catch (error) {
      console.log(`   ❌ Error checking recent articles: ${error.message}`);
    }

    // 7. Test AI service (if API key is available)
    console.log('\n7. Testing AI service:');
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        const result = await model.generateContent('Test connection');
        console.log('   ✅ Gemini AI connection successful');
      } catch (error) {
        console.log(`   ❌ Gemini AI connection failed: ${error.message}`);
      }
    } else {
      console.log('   ⚠️  GEMINI_API_KEY not set, skipping AI test');
    }

    // 8. Recommendations
    console.log('\n8. Recommendations:');
    
    if (!process.env.DATABASE_URL) {
      console.log('   🔧 Set DATABASE_URL environment variable');
    }
    
    if (!process.env.GEMINI_API_KEY) {
      console.log('   🔧 Set GEMINI_API_KEY environment variable');
    }
    
    try {
      const activeSources = await pool.query('SELECT COUNT(*) as count FROM sources WHERE active = true');
      if (activeSources.rows[0].count === 0) {
        console.log('   🔧 Run: npm run db:seed (to add data sources)');
      }
    } catch (error) {
      console.log('   🔧 Run: npm run db:migrate (to create database tables)');
    }

    console.log('\n9. Manual testing commands:');
    console.log('   curl -X POST https://your-domain.vercel.app/api/cron/content-pipeline');
    console.log('   curl -X POST https://your-domain.vercel.app/api/cron/quality-check');

  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
  } finally {
    await pool.end();
  }
}

diagnoseCronIssues();
