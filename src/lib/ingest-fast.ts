import { Database, Source, RawItem } from './database';
import Parser from 'rss-parser';

const parser = new Parser();

export class FastIngestService {
  // Curated list of fastest, most reliable sources
  private static fastSources = [
    'The Verge',
    'Ars Technica', 
    'Engadget',
    'OpenAI Blog',
    'React GitHub',
    'Next.js GitHub',
    'Vue GitHub',
    'TypeScript GitHub'
  ];

  static async runFastIngest(): Promise<number> {
    try {
      console.log('🚀 Starting fast ingest (top sources only)...');
      
      // Get only the fastest sources
      const sources = await Database.getActiveSources();
      const fastSources = sources.filter(source => 
        this.fastSources.includes(source.name)
      );
      
      console.log(`Processing ${fastSources.length} fast sources...`);
      
      const allItems: Omit<RawItem, 'id' | 'created_at'>[] = [];
      
      for (const source of fastSources) {
        try {
          const items = await this.ingestSource(source);
          allItems.push(...items);
          console.log(`Ingested ${items.length} items from ${source.name}`);
          
          // Minimal delay for speed
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`Failed to ingest source ${source.name}:`, error);
          // Continue with next source
        }
      }
      
      if (allItems.length > 0) {
        for (const item of allItems) {
          await Database.insertRawItem(item);
        }
        console.log(`Found ${allItems.length} new items`);
      }
      
      return allItems.length;
    } catch (error) {
      console.error('Fast ingest failed:', error);
      return 0;
    }
  }

  private static async ingestSource(source: Source): Promise<Omit<RawItem, 'id' | 'created_at'>[]> {
    if (source.kind === 'rss') {
      return this.ingestRSS(source);
    } else if (source.kind === 'github') {
      return this.ingestGitHub(source);
    }
    return [];
  }

  private static async ingestRSS(source: Source): Promise<Omit<RawItem, 'id' | 'created_at'>[]> {
    try {
      // Quick timeout for RSS
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const feed = await parser.parseURL(source.url);
      clearTimeout(timeoutId);
      
      const items: Omit<RawItem, 'id' | 'created_at'>[] = [];

      // Process only first 10 items for speed
      for (const item of feed.items.slice(0, 10)) {
        if (!item.link || !item.title) continue;

        const hash = this.generateHash(`${source.url}:${item.link}:${item.title}`);
        
        // Check if we already have this item
        const existing = await Database.getRawItemByHash(hash);
        if (existing) continue;

        items.push({
          source_id: source.id,
          external_id: item.guid || item.link,
          title: item.title,
          url: item.link,
          published_at: item.pubDate ? new Date(item.pubDate) : undefined,
          payload: {
            description: item.contentSnippet || item.content,
            categories: item.categories,
            creator: item.creator,
            isoDate: item.isoDate,
            raw: item
          },
          uniq_hash: hash
        });
      }

      return items;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`RSS timeout for ${source.url} - skipping`);
      } else {
        console.error(`Failed to ingest RSS from ${source.url}:`, error instanceof Error ? error.message : 'Unknown error');
      }
      return [];
    }
  }

  private static async ingestGitHub(source: Source): Promise<Omit<RawItem, 'id' | 'created_at'>[]> {
    try {
      const [owner, repo] = source.url.split('/');
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases?per_page=5`);
      
      if (!response.ok) {
        console.error(`GitHub API error for ${source.url}: ${response.status}`);
        return [];
      }
      
      const releases = await response.json();
      const items: Omit<RawItem, 'id' | 'created_at'>[] = [];

      for (const release of releases) {
        if (!release.tag_name || !release.name) continue;

        const hash = this.generateHash(`${source.url}:${release.tag_name}:${release.name}`);
        
        // Check if we already have this item
        const existing = await Database.getRawItemByHash(hash);
        if (existing) continue;

        items.push({
          source_id: source.id,
          external_id: release.tag_name,
          title: release.name,
          url: release.html_url,
          published_at: new Date(release.published_at),
          payload: {
            description: release.body,
            tag_name: release.tag_name,
            prerelease: release.prerelease,
            draft: release.draft,
            raw: release
          },
          uniq_hash: hash
        });
      }

      return items;
    } catch (error) {
      console.error(`Failed to ingest GitHub from ${source.url}:`, error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  private static generateHash(input: string): string {
    // Simple hash function for deduplication
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }
}
