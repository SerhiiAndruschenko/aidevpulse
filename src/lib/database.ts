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
}

export default Database;
