const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  try {
    console.log('Starting database migration...');

    // Create sources table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sources (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        kind TEXT CHECK (kind IN ('rss','github','registry','blog')),
        url TEXT NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Create items_raw table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS items_raw (
        id BIGSERIAL PRIMARY KEY,
        source_id INTEGER REFERENCES sources(id),
        external_id TEXT,
        title TEXT,
        url TEXT,
        published_at TIMESTAMPTZ,
        payload JSONB,
        uniq_hash TEXT UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Create articles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id BIGSERIAL PRIMARY KEY,
        slug TEXT UNIQUE,
        title TEXT NOT NULL,
        dek TEXT,
        body_html TEXT NOT NULL,
        word_count INTEGER,
        hero_url TEXT,
        lang TEXT DEFAULT 'en',
        author_type TEXT CHECK (author_type IN ('ai','human')) DEFAULT 'ai',
        review_status TEXT CHECK (review_status IN ('auto','needs_review','reviewed')) DEFAULT 'auto',
        primary_source_url TEXT,
        published_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Create citations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS citations (
        id BIGSERIAL PRIMARY KEY,
        article_id BIGINT REFERENCES articles(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        title TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Create tags table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Create article_tags junction table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS article_tags (
        article_id BIGINT REFERENCES articles(id) ON DELETE CASCADE,
        tag_id INTEGER REFERENCES tags(id),
        PRIMARY KEY(article_id, tag_id)
      );
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_items_raw_source_id ON items_raw(source_id);
      CREATE INDEX IF NOT EXISTS idx_items_raw_published_at ON items_raw(published_at);
      CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
      CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
      CREATE INDEX IF NOT EXISTS idx_citations_article_id ON citations(article_id);
    `);

    console.log('Database migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
