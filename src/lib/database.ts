import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export interface Source {
  id: number;
  name: string;
  kind: 'rss' | 'github' | 'registry' | 'blog';
  url: string;
  active: boolean;
  created_at: Date;
}

export interface RawItem {
  id: number;
  source_id: number;
  external_id?: string;
  title?: string;
  url?: string;
  published_at?: Date;
  payload?: any;
  uniq_hash: string;
  created_at: Date;
}

export interface Article {
  id: number;
  slug: string;
  title: string;
  dek?: string;
  body_html: string;
  word_count?: number;
  hero_url?: string;
  lang: string;
  author_type: 'ai' | 'human';
  review_status: 'auto' | 'needs_review' | 'reviewed';
  primary_source_url?: string;
  published_at: Date;
  created_at: Date;
}

export interface Citation {
  id: number;
  article_id: number;
  url: string;
  title?: string;
  created_at: Date;
}

export interface Tag {
  id: number;
  name: string;
  created_at: Date;
}

export class Database {
  static async query(text: string, params?: any[]) {
    return pool.query(text, params);
  }

  static async getClient() {
    return pool.connect();
  }

  // Sources
  static async getActiveSources(): Promise<Source[]> {
    const result = await pool.query('SELECT * FROM sources WHERE active = true ORDER BY name');
    return result.rows;
  }

  static async getSourceById(id: number): Promise<Source | null> {
    const result = await pool.query('SELECT * FROM sources WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  // Raw Items
  static async insertRawItem(item: Omit<RawItem, 'id' | 'created_at'>): Promise<RawItem> {
    const result = await pool.query(
      `INSERT INTO items_raw (source_id, external_id, title, url, published_at, payload, uniq_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [item.source_id, item.external_id, item.title, item.url, item.published_at, item.payload, item.uniq_hash]
    );
    return result.rows[0];
  }

  static async getRawItemByHash(hash: string): Promise<RawItem | null> {
    const result = await pool.query('SELECT * FROM items_raw WHERE uniq_hash = $1', [hash]);
    return result.rows[0] || null;
  }

  static async getRecentRawItems(limit: number = 100): Promise<RawItem[]> {
    const result = await pool.query(
      'SELECT * FROM items_raw ORDER BY published_at DESC NULLS LAST LIMIT $1',
      [limit]
    );
    return result.rows;
  }

  static async clearOldRawItems(daysToKeep: number = 7): Promise<number> {
    // Validate input to prevent SQL injection
    if (!Number.isInteger(daysToKeep) || daysToKeep < 0 || daysToKeep > 365) {
      throw new Error('Invalid daysToKeep parameter');
    }
    
    const result = await pool.query(
      `DELETE FROM items_raw WHERE created_at < NOW() - INTERVAL '${daysToKeep} days'`
    );
    return result.rowCount || 0;
  }

  static async clearAllRawItems(): Promise<number> {
    const result = await pool.query('DELETE FROM items_raw');
    return result.rowCount || 0;
  }

  static async getRawItemsCount(): Promise<number> {
    const result = await pool.query('SELECT COUNT(*) as count FROM items_raw');
    return parseInt(result.rows[0].count);
  }

  static async getSimilarArticles(title: string, daysBack: number = 7): Promise<Article[]> {
    // Extract key words from title for similarity check
    const titleWords = title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2) // Reduced to 2 characters for more sensitivity
      .slice(0, 8); // Take more words for better matching
    
    if (titleWords.length === 0) return [];
    
    // Create multiple patterns for better matching
    const patterns: string[] = [];
    const likePatterns: string[] = [];
    
    // Add full pattern
    patterns.push(`(${titleWords.join('|')})`);
    
    // Add individual word patterns
    titleWords.forEach(word => {
      likePatterns.push(`%${word}%`);
    });
    
    // Add partial patterns (first 3 words, first 4 words, etc.)
    for (let i = 3; i <= Math.min(titleWords.length, 6); i++) {
      const partialWords = titleWords.slice(0, i);
      patterns.push(`(${partialWords.join('|')})`);
    }
    
    // Build the query with multiple conditions
    const regexConditions = patterns.map((_, index) => `LOWER(title) ~ $${index + 1}`).join(' OR ');
    const likeConditions = likePatterns.map((_, index) => `LOWER(title) LIKE $${patterns.length + index + 1}`).join(' OR ');
    
    const allParams = [...patterns, ...likePatterns];
    
    const result = await pool.query(
      `SELECT * FROM articles 
       WHERE published_at >= NOW() - INTERVAL '${daysBack} days'
       AND (${regexConditions} OR ${likeConditions})
       ORDER BY published_at DESC
       LIMIT 10`,
      allParams
    );
    
    // Additional check: also check for similar slugs
    const slugWords = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .split('-')
      .filter(word => word.length > 2)
      .slice(0, 5);
    
    if (slugWords.length > 0) {
      const slugPattern = slugWords.join('|');
      const slugResult = await pool.query(
        `SELECT * FROM articles 
         WHERE published_at >= NOW() - INTERVAL '${daysBack} days'
         AND LOWER(slug) ~ $1
         ORDER BY published_at DESC
         LIMIT 5`,
        [`(${slugPattern})`]
      );
      
      // Merge results and remove duplicates
      const allResults = [...result.rows, ...slugResult.rows];
      const uniqueResults = allResults.filter((article, index, self) => 
        index === self.findIndex(a => a.id === article.id)
      );
      
      return uniqueResults;
    }
    
    return result.rows;
  }

  // Articles
  static async insertArticle(article: Omit<Article, 'id' | 'created_at'>): Promise<Article> {
    const result = await pool.query(
      `INSERT INTO articles (slug, title, dek, body_html, word_count, hero_url, lang, author_type, review_status, primary_source_url, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [article.slug, article.title, article.dek, article.body_html, article.word_count, article.hero_url, article.lang, article.author_type, article.review_status, article.primary_source_url, article.published_at]
    );
    return result.rows[0];
  }

  static async getArticleBySlug(slug: string): Promise<Article | null> {
    const result = await pool.query('SELECT * FROM articles WHERE slug = $1', [slug]);
    return result.rows[0] || null;
  }

  static async getPublishedArticles(limit: number = 20, offset: number = 0): Promise<Article[]> {
    const result = await pool.query(
      'SELECT * FROM articles WHERE published_at <= NOW() ORDER BY published_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  }

  static async getArticlesByTag(tagName: string, limit: number = 20, offset: number = 0): Promise<Article[]> {
    const result = await pool.query(
      `SELECT a.* FROM articles a
       JOIN article_tags at ON a.id = at.article_id
       JOIN tags t ON at.tag_id = t.id
       WHERE t.name = $1 AND a.published_at <= NOW()
       ORDER BY a.published_at DESC
       LIMIT $2 OFFSET $3`,
      [tagName, limit, offset]
    );
    return result.rows;
  }

  // Citations
  static async insertCitations(citations: Omit<Citation, 'id' | 'created_at'>[]): Promise<Citation[]> {
    if (citations.length === 0) return [];
    
    const values = citations.map((_, i) => 
      `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`
    ).join(', ');
    
    const params = citations.flatMap(c => [c.article_id, c.url, c.title]);
    
    const result = await pool.query(
      `INSERT INTO citations (article_id, url, title) VALUES ${values} RETURNING *`,
      params
    );
    return result.rows;
  }

  static async getCitationsByArticleId(articleId: number): Promise<Citation[]> {
    const result = await pool.query('SELECT * FROM citations WHERE article_id = $1 ORDER BY created_at', [articleId]);
    return result.rows;
  }

  // Tags
  static async getOrCreateTag(name: string): Promise<Tag> {
    const result = await pool.query(
      'INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING *',
      [name]
    );
    return result.rows[0];
  }

  static async attachTagsToArticle(articleId: number, tagNames: string[]): Promise<void> {
    if (tagNames.length === 0) return;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const tagName of tagNames) {
        const tag = await this.getOrCreateTag(tagName);
        await client.query(
          'INSERT INTO article_tags (article_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [articleId, tag.id]
        );
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getTagsByArticleId(articleId: number): Promise<Tag[]> {
    const result = await pool.query(
      `SELECT t.* FROM tags t
       JOIN article_tags at ON t.id = at.tag_id
       WHERE at.article_id = $1
       ORDER BY t.name`,
      [articleId]
    );
    return result.rows;
  }

  static async getAllTags(): Promise<Tag[]> {
    const result = await pool.query('SELECT * FROM tags ORDER BY name');
    return result.rows;
  }

  // Pagination methods
  static async getArticles(limit: number = 10, offset: number = 0): Promise<Article[]> {
    const result = await pool.query(
      'SELECT * FROM articles ORDER BY published_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  }

  static async getArticlesCount(): Promise<number> {
    const result = await pool.query('SELECT COUNT(*) as count FROM articles');
    return parseInt(result.rows[0].count);
  }

  static async getArticlesCountByTag(tagName: string): Promise<number> {
    const result = await pool.query(
      `SELECT COUNT(DISTINCT a.id) as count 
       FROM articles a
       JOIN article_tags at ON a.id = at.article_id
       JOIN tags t ON at.tag_id = t.id
       WHERE t.name = $1`,
      [tagName]
    );
    return parseInt(result.rows[0].count);
  }
}

export default Database;
