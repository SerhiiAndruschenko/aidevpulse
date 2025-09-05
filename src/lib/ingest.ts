import Parser from 'rss-parser';
import { createHash } from 'crypto';
import { Database, Source, RawItem } from './database';

const parser = new Parser();

export interface IngestedItem {
  source_id: number;
  external_id?: string;
  title?: string;
  url?: string;
  published_at?: Date;
  payload: any;
  uniq_hash: string;
}

export class IngestService {
  static generateHash(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }

  static async ingestRSS(source: Source): Promise<IngestedItem[]> {
    try {
      const feed = await parser.parseURL(source.url);
      const items: IngestedItem[] = [];

      for (const item of feed.items) {
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
      console.error(`Failed to ingest RSS from ${source.url}:`, error);
      return [];
    }
  }

  static async ingestGitHub(source: Source): Promise<IngestedItem[]> {
    try {
      const [owner, repo] = source.url.split('/');
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases?per_page=10`);
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const releases = await response.json();
      const items: IngestedItem[] = [];

      for (const release of releases) {
        if (!release.tag_name || !release.html_url) continue;

        const hash = this.generateHash(`${source.url}:${release.tag_name}:${release.published_at}`);
        
        // Check if we already have this item
        const existing = await Database.getRawItemByHash(hash);
        if (existing) continue;

        items.push({
          source_id: source.id,
          external_id: release.tag_name,
          title: `${repo} ${release.tag_name}`,
          url: release.html_url,
          published_at: release.published_at ? new Date(release.published_at) : undefined,
          payload: {
            tag_name: release.tag_name,
            name: release.name,
            body: release.body,
            prerelease: release.prerelease,
            draft: release.draft,
            assets: release.assets,
            author: release.author,
            raw: release
          },
          uniq_hash: hash
        });
      }

      return items;
    } catch (error) {
      console.error(`Failed to ingest GitHub releases from ${source.url}:`, error);
      return [];
    }
  }

  static async ingestNPM(source: Source): Promise<IngestedItem[]> {
    try {
      // For npm, we'll check for recent versions
      const packageName = source.url;
      const response = await fetch(`https://registry.npmjs.org/${packageName}`);
      
      if (!response.ok) {
        throw new Error(`NPM API error: ${response.status}`);
      }

      const packageData = await response.json();
      const versions = Object.keys(packageData.versions || {});
      const recentVersions = versions.slice(-5); // Last 5 versions
      
      const items: IngestedItem[] = [];

      for (const version of recentVersions) {
        const versionData = packageData.versions[version];
        const hash = this.generateHash(`${source.url}:${version}:${versionData.time}`);
        
        // Check if we already have this item
        const existing = await Database.getRawItemByHash(hash);
        if (existing) continue;

        items.push({
          source_id: source.id,
          external_id: version,
          title: `${packageName} v${version}`,
          url: `https://www.npmjs.com/package/${packageName}/v/${version}`,
          published_at: versionData.time ? new Date(versionData.time) : undefined,
          payload: {
            version,
            description: versionData.description,
            keywords: versionData.keywords,
            dependencies: versionData.dependencies,
            devDependencies: versionData.devDependencies,
            time: versionData.time,
            raw: versionData
          },
          uniq_hash: hash
        });
      }

      return items;
    } catch (error) {
      console.error(`Failed to ingest NPM package ${source.url}:`, error);
      return [];
    }
  }

  static async ingestSource(source: Source): Promise<IngestedItem[]> {
    switch (source.kind) {
      case 'rss':
        return this.ingestRSS(source);
      case 'github':
        return this.ingestGitHub(source);
      case 'registry':
        return this.ingestNPM(source);
      default:
        console.warn(`Unknown source kind: ${source.kind}`);
        return [];
    }
  }

  static async ingestAllSources(): Promise<IngestedItem[]> {
    const sources = await Database.getActiveSources();
    const allItems: IngestedItem[] = [];

    console.log(`Starting ingest for ${sources.length} sources...`);

    for (const source of sources) {
      try {
        const items = await this.ingestSource(source);
        allItems.push(...items);
        console.log(`Ingested ${items.length} items from ${source.name}`);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to ingest source ${source.name}:`, error);
      }
    }

    return allItems;
  }

  static async saveIngestedItems(items: IngestedItem[]): Promise<RawItem[]> {
    const savedItems: RawItem[] = [];

    for (const item of items) {
      try {
        const savedItem = await Database.insertRawItem(item);
        savedItems.push(savedItem);
      } catch (error) {
        console.error(`Failed to save item ${item.uniq_hash}:`, error);
      }
    }

    return savedItems;
  }

  static async runDailyIngest(): Promise<number> {
    console.log('Starting daily ingest...');
    
    const items = await this.ingestAllSources();
    console.log(`Found ${items.length} new items`);
    
    const savedItems = await this.saveIngestedItems(items);
    console.log(`Saved ${savedItems.length} items to database`);
    
    return savedItems.length;
  }
}

export default IngestService;
