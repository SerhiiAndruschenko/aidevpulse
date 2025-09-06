import { RawItem } from './database';

export interface RankedItem extends RawItem {
  score: number;
  reasons: string[];
}

export interface RankingConfig {
  // Topic relevance keywords (whitelist)
  relevantKeywords: string[];
  // High-priority sources
  prioritySources: number[];
  // Minimum score threshold
  minScore: number;
  // Maximum items to consider
  maxItems: number;
}

export class RankingService {
  private static readonly DEFAULT_CONFIG: RankingConfig = {
    relevantKeywords: [
      // Frameworks
      'react', 'nextjs', 'vue', 'angular', 'svelte', 'nuxt', 'vite', 'bun', 'deno',
      // Languages
      'typescript', 'javascript', 'nodejs', 'python', 'rust', 'go',
      // AI/ML
      'ai', 'artificial intelligence', 'machine learning', 'ml', 'openai', 'gemini', 'claude',
      // Cloud & Infrastructure
      'aws', 'azure', 'gcp', 'google cloud', 'vercel', 'netlify', 'docker', 'kubernetes',
      // Databases
      'postgresql', 'mysql', 'redis', 'mongodb', 'elasticsearch',
      // Tools & Libraries
      'webpack', 'rollup', 'esbuild', 'swc', 'tailwind', 'bootstrap',
      // Release keywords
      'release', 'update', 'version', 'changelog', 'breaking', 'migration'
    ],
    prioritySources: [], // Will be populated based on source importance
    minScore: 0.3,
    maxItems: 50
  };

  static calculateRelevanceScore(item: RawItem, config: RankingConfig): number {
    let score = 0;
    const reasons: string[] = [];
    const text = `${item.title || ''} ${JSON.stringify(item.payload || {})}`.toLowerCase();

    // Check for relevant keywords
    const keywordMatches = config.relevantKeywords.filter(keyword => 
      text.includes(keyword.toLowerCase())
    );
    
    if (keywordMatches.length > 0) {
      score += keywordMatches.length * 0.2;
      reasons.push(`Relevant keywords: ${keywordMatches.join(', ')}`);
    }

    // Boost for release/version announcements
    if (text.includes('release') || text.includes('version') || text.includes('v')) {
      score += 0.3;
      reasons.push('Release/version announcement');
    }

    // Boost for breaking changes
    if (text.includes('breaking') || text.includes('migration')) {
      score += 0.4;
      reasons.push('Breaking changes mentioned');
    }

    // Boost for major version releases (v2.0, v3.0, etc.)
    const majorVersionMatch = text.match(/v?(\d+)\.0\.0/);
    if (majorVersionMatch) {
      score += 0.5;
      reasons.push('Major version release');
    }

    // Boost for security updates
    if (text.includes('security') || text.includes('vulnerability') || text.includes('cve')) {
      score += 0.4;
      reasons.push('Security update');
    }

    // Boost for performance improvements
    if (text.includes('performance') || text.includes('faster') || text.includes('optimization')) {
      score += 0.2;
      reasons.push('Performance improvements');
    }

    // Boost for new features
    if (text.includes('new feature') || text.includes('introducing') || text.includes('added')) {
      score += 0.2;
      reasons.push('New features');
    }

    // Boost for priority sources
    if (config.prioritySources.includes(item.source_id)) {
      score += 0.3;
      reasons.push('Priority source');
    }

    // Recency boost (newer items get higher scores)
    if (item.published_at) {
      const daysSincePublished = (Date.now() - item.published_at.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSincePublished <= 1) {
        score += 0.3;
        reasons.push('Very recent (within 24h)');
      } else if (daysSincePublished <= 7) {
        score += 0.2;
        reasons.push('Recent (within 7 days)');
      } else if (daysSincePublished <= 30) {
        score += 0.1;
        reasons.push('Recent (within 30 days)');
      }
    }

    // Quality indicators
    if (item.title && item.title.length > 10) {
      score += 0.1;
      reasons.push('Good title length');
    }

    if (item.url && item.url.includes('github.com')) {
      score += 0.1;
      reasons.push('GitHub source');
    }

    // Penalty for very short content
    const contentLength = JSON.stringify(item.payload || {}).length;
    if (contentLength < 100) {
      score -= 0.2;
      reasons.push('Short content (penalty)');
    }

    return Math.max(0, Math.min(1, score)); // Clamp between 0 and 1
  }

  static rankItems(items: RawItem[], config: RankingConfig = this.DEFAULT_CONFIG): RankedItem[] {
    const rankedItems: RankedItem[] = items.map(item => {
      const score = this.calculateRelevanceScore(item, config);
      const reasons: string[] = [];
      
      // Recalculate to get reasons
      const text = `${item.title || ''} ${JSON.stringify(item.payload || {})}`.toLowerCase();
      const keywordMatches = config.relevantKeywords.filter(keyword => 
        text.includes(keyword.toLowerCase())
      );
      
      if (keywordMatches.length > 0) {
        reasons.push(`Keywords: ${keywordMatches.join(', ')}`);
      }
      
      if (text.includes('release') || text.includes('version')) {
        reasons.push('Release announcement');
      }
      
      if (text.includes('breaking') || text.includes('migration')) {
        reasons.push('Breaking changes');
      }
      
      if (item.published_at) {
        const daysSincePublished = (Date.now() - item.published_at.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSincePublished <= 1) {
          reasons.push('Very recent');
        } else if (daysSincePublished <= 7) {
          reasons.push('Recent');
        }
      }

      return {
        ...item,
        score,
        reasons
      };
    });

    // Sort by score descending
    rankedItems.sort((a, b) => b.score - a.score);

    // Filter by minimum score and limit
    return rankedItems
      .filter(item => item.score >= config.minScore)
      .slice(0, config.maxItems);
  }

  static selectBestCandidate(rankedItems: RankedItem[]): RankedItem | null {
    if (rankedItems.length === 0) return null;

    // For now, just return the highest scoring item
    // In the future, we could implement more sophisticated selection logic
    // (e.g., avoid similar topics from recent days, balance different categories)
    return rankedItems[0];
  }

  static selectTopCandidates(rankedItems: RankedItem[], count: number = 3): RankedItem[] {
    if (rankedItems.length === 0) return [];

    // Filter out items that are too similar to avoid duplicate content
    const selectedItems: RankedItem[] = [];
    const usedTopics = new Set<string>();
    const usedTitles = new Set<string>();

    for (const item of rankedItems) {
      if (selectedItems.length >= count) break;

      // Check for exact title duplicates
      const normalizedTitle = item.title?.toLowerCase().trim();
      if (normalizedTitle && usedTitles.has(normalizedTitle)) {
        continue; // Skip duplicate titles
      }

      // Extract topic keywords from title and payload
      const topicKeywords = this.extractTopicKeywords(item);
      
      // Check if this topic is too similar to already selected ones
      const isSimilar = topicKeywords.some(keyword => 
        usedTopics.has(keyword.toLowerCase())
      );

      if (!isSimilar) {
        selectedItems.push(item);
        topicKeywords.forEach(keyword => usedTopics.add(keyword.toLowerCase()));
        if (normalizedTitle) {
          usedTitles.add(normalizedTitle);
        }
      }
    }

    // If we don't have enough diverse items, fill with remaining top items
    if (selectedItems.length < count) {
      for (const item of rankedItems) {
        if (selectedItems.length >= count) break;
        
        // Check for title duplicates even in fallback
        const normalizedTitle = item.title?.toLowerCase().trim();
        if (normalizedTitle && usedTitles.has(normalizedTitle)) {
          continue;
        }
        
        if (!selectedItems.includes(item)) {
          selectedItems.push(item);
          if (normalizedTitle) {
            usedTitles.add(normalizedTitle);
          }
        }
      }
    }

    return selectedItems.slice(0, count);
  }

  private static extractTopicKeywords(item: RankedItem): string[] {
    const keywords: string[] = [];
    const text = `${item.title || ''} ${JSON.stringify(item.payload || {})}`.toLowerCase();

    // Extract framework/library names
    const frameworks = ['react', 'nextjs', 'vue', 'angular', 'svelte', 'nodejs', 'typescript', 'javascript', 'python', 'rust', 'go'];
    frameworks.forEach(framework => {
      if (text.includes(framework)) {
        keywords.push(framework);
      }
    });

    // Extract version numbers
    const versionMatch = text.match(/v?(\d+\.\d+\.\d+)/);
    if (versionMatch) {
      keywords.push(versionMatch[1]);
    }

    // Extract release type
    if (text.includes('release')) keywords.push('release');
    if (text.includes('update')) keywords.push('update');
    if (text.includes('breaking')) keywords.push('breaking');
    if (text.includes('security')) keywords.push('security');

    return keywords;
  }

  static buildFactsPack(item: RankedItem): any {
    const payload = item.payload || {};
    
    // Extract key information based on source type
    let topic = item.title || 'Unknown Topic';
    let version = '';
    let date = item.published_at?.toISOString().split('T')[0] || '';
    let highlights: string[] = [];
    let risk: string[] = [];
    let ecosystem: string[] = [];

    // Parse GitHub releases
    if (payload.tag_name) {
      version = payload.tag_name;
      topic = `${item.title} Release`;
      
      if (payload.body) {
        const body = payload.body.toLowerCase();
        
        // Extract highlights
        if (body.includes('breaking')) risk.push('Breaking changes detected');
        if (body.includes('security')) highlights.push('Security updates');
        if (body.includes('performance')) highlights.push('Performance improvements');
        if (body.includes('new feature')) highlights.push('New features');
        
        // Extract ecosystem info
        if (body.includes('react')) ecosystem.push('React ecosystem');
        if (body.includes('node')) ecosystem.push('Node.js ecosystem');
        if (body.includes('typescript')) ecosystem.push('TypeScript ecosystem');
      }
    }

    // Parse RSS items
    if (payload.description) {
      const desc = payload.description.toLowerCase();
      
      if (desc.includes('breaking')) risk.push('Breaking changes mentioned');
      if (desc.includes('security')) highlights.push('Security updates');
      if (desc.includes('performance')) highlights.push('Performance improvements');
    }

    return {
      topic,
      sources: [
        {
          url: item.url || '',
          title: item.title || ''
        }
      ],
      key_facts: {
        version,
        date,
        highlights: highlights.length > 0 ? highlights : ['Release announcement'],
        risk: risk.length > 0 ? risk : [],
        ecosystem: ecosystem.length > 0 ? ecosystem : []
      },
      audience: 'experienced web developers',
      language: 'en'
    };
  }
}

export default RankingService;
