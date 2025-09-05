const { Pool } = require('pg');
require('dotenv').config();

async function testSystem() {
  console.log('🧪 Testing AIDevPulse System...\n');

  // Test 1: Database Connection
  console.log('1. Testing database connection...');
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    console.log(`   Current time: ${result.rows[0].now}\n`);
    
    await pool.end();
  } catch (error) {
    console.log('❌ Database connection failed');
    console.log(`   Error: ${error.message}\n`);
    return;
  }

  // Test 2: Environment Variables
  console.log('2. Checking environment variables...');
  const requiredVars = ['DATABASE_URL', 'GEMINI_API_KEY'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length === 0) {
    console.log('✅ All required environment variables are set\n');
  } else {
    console.log('❌ Missing environment variables:');
    missingVars.forEach(varName => console.log(`   - ${varName}`));
    console.log('');
  }

  // Test 3: Check if tables exist
  console.log('3. Checking database tables...');
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    const tables = ['sources', 'items_raw', 'articles', 'citations', 'tags', 'article_tags'];
    const existingTables = [];
    
    for (const table of tables) {
      try {
        await pool.query(`SELECT 1 FROM ${table} LIMIT 1`);
        existingTables.push(table);
      } catch (error) {
        // Table doesn't exist
      }
    }
    
    if (existingTables.length === tables.length) {
      console.log('✅ All required tables exist');
      console.log(`   Tables: ${existingTables.join(', ')}\n`);
    } else {
      console.log('❌ Some tables are missing');
      console.log(`   Existing: ${existingTables.join(', ')}`);
      console.log(`   Missing: ${tables.filter(t => !existingTables.includes(t)).join(', ')}\n`);
    }
    
    await pool.end();
  } catch (error) {
    console.log('❌ Failed to check tables');
    console.log(`   Error: ${error.message}\n`);
  }

  // Test 4: Check sources count
  console.log('4. Checking data sources...');
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    const sourcesResult = await pool.query('SELECT COUNT(*) as count FROM sources WHERE active = true');
    const sourcesCount = parseInt(sourcesResult.rows[0].count);
    
    if (sourcesCount > 0) {
      console.log(`✅ Found ${sourcesCount} active data sources\n`);
    } else {
      console.log('❌ No active data sources found');
      console.log('   Run: npm run db:seed\n');
    }
    
    await pool.end();
  } catch (error) {
    console.log('❌ Failed to check sources');
    console.log(`   Error: ${error.message}\n`);
  }

  // Test 5: Check articles count
  console.log('5. Checking existing articles...');
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    const articlesResult = await pool.query('SELECT COUNT(*) as count FROM articles');
    const articlesCount = parseInt(articlesResult.rows[0].count);
    
    console.log(`📝 Found ${articlesCount} articles in database\n`);
    
    await pool.end();
  } catch (error) {
    console.log('❌ Failed to check articles');
    console.log(`   Error: ${error.message}\n`);
  }

  console.log('🎉 System test completed!');
  console.log('\nNext steps:');
  console.log('1. Make sure all environment variables are set');
  console.log('2. Run: npm run db:migrate (if tables are missing)');
  console.log('3. Run: npm run db:seed (if no sources found)');
  console.log('4. Start the development server: npm run dev');
  console.log('5. Test cron jobs manually: POST /api/cron/ingest');
}

testSystem().catch(console.error);
