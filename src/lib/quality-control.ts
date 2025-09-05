import { Database } from './database';

export interface QualityCheck {
  id: string;
  type: 'link_validation' | 'content_analysis' | 'fact_check' | 'seo_check';
  status: 'pending' | 'passed' | 'failed' | 'warning';
  message: string;
  details?: any;
}

export interface QualityReport {
  articleId: number;
  overallScore: number;
  checks: QualityCheck[];
  recommendations: string[];
}

export class QualityControlService {
  static async validateLinks(urls: string[]): Promise<QualityCheck[]> {
    const checks: QualityCheck[] = [];
    
    for (const url of urls) {
      try {
        const response = await fetch(url, { 
          method: 'HEAD',
          timeout: 10000 
        });
        
        if (response.ok) {
          checks.push({
            id: `link_${url}`,
            type: 'link_validation',
            status: 'passed',
            message: `Link is accessible: ${url}`,
            details: { status: response.status }
          });
        } else {
          checks.push({
            id: `link_${url}`,
            type: 'link_validation',
            status: 'failed',
            message: `Link returned ${response.status}: ${url}`,
            details: { status: response.status }
          });
        }
      } catch (error) {
        checks.push({
          id: `link_${url}`,
          type: 'link_validation',
          status: 'failed',
          message: `Link validation failed: ${url}`,
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        });
      }
    }
    
    return checks;
  }

  static analyzeContent(content: string): QualityCheck[] {
    const checks: QualityCheck[] = [];
    
    // Check for forbidden patterns
    const forbiddenPatterns = [
      { pattern: /as we all know/gi, message: 'Avoid cliché phrases like "as we all know"' },
      { pattern: /in today's world/gi, message: 'Avoid cliché phrases like "in today\'s world"' },
      { pattern: /it's no secret/gi, message: 'Avoid cliché phrases like "it\'s no secret"' },
      { pattern: /everyone knows/gi, message: 'Avoid cliché phrases like "everyone knows"' },
      { pattern: /obviously/gi, message: 'Avoid unnecessary qualifiers like "obviously"' },
      { pattern: /clearly/gi, message: 'Avoid unnecessary qualifiers like "clearly"' },
      { pattern: /undoubtedly/gi, message: 'Avoid unnecessary qualifiers like "undoubtedly"' }
    ];

    for (const { pattern, message } of forbiddenPatterns) {
      if (pattern.test(content)) {
        checks.push({
          id: `content_pattern_${pattern.source}`,
          type: 'content_analysis',
          status: 'warning',
          message,
          details: { pattern: pattern.source }
        });
      }
    }

    // Check content length
    const wordCount = content.split(/\s+/).length;
    if (wordCount < 200) {
      checks.push({
        id: 'content_length_short',
        type: 'content_analysis',
        status: 'warning',
        message: 'Content is quite short (less than 200 words)',
        details: { wordCount }
      });
    } else if (wordCount > 3000) {
      checks.push({
        id: 'content_length_long',
        type: 'content_analysis',
        status: 'warning',
        message: 'Content is quite long (more than 3000 words)',
        details: { wordCount }
      });
    }

    // Check for code snippets
    if (!/<pre|<code/.test(content)) {
      checks.push({
        id: 'content_no_code',
        type: 'content_analysis',
        status: 'warning',
        message: 'No code snippets found - consider adding examples',
        details: {}
      });
    }

    // Check for headings structure
    const headingCount = (content.match(/<h[1-6]/g) || []).length;
    if (headingCount < 2) {
      checks.push({
        id: 'content_headings',
        type: 'content_analysis',
        status: 'warning',
        message: 'Consider adding more headings for better structure',
        details: { headingCount }
      });
    }

    return checks;
  }

  static async factCheckArticle(article: any, factsPack: any): Promise<QualityCheck[]> {
    const checks: QualityCheck[] = [];
    
    // Check if mentioned versions match facts pack
    const versionRegex = /v?(\d+\.\d+\.\d+)/g;
    const articleVersions = [...article.body_html.matchAll(versionRegex)].map(m => m[1]);
    const factVersions = factsPack.key_facts.version ? [factsPack.key_facts.version] : [];
    
    for (const version of articleVersions) {
      if (!factVersions.includes(version)) {
        checks.push({
          id: `fact_version_${version}`,
          type: 'fact_check',
          status: 'warning',
          message: `Version ${version} mentioned but not in facts pack`,
          details: { version, factVersions }
        });
      }
    }

    // Check if breaking changes are properly highlighted
    if (factsPack.key_facts.risk && factsPack.key_facts.risk.length > 0) {
      const hasBreakingSection = /breaking changes?/i.test(article.body_html);
      if (!hasBreakingSection) {
        checks.push({
          id: 'fact_breaking_changes',
          type: 'fact_check',
          status: 'warning',
          message: 'Breaking changes detected in facts but not highlighted in article',
          details: { risks: factsPack.key_facts.risk }
        });
      }
    }

    return checks;
  }

  static analyzeSEO(article: any): QualityCheck[] {
    const checks: QualityCheck[] = [];
    
    // Check title length
    if (article.title.length < 30) {
      checks.push({
        id: 'seo_title_short',
        type: 'seo_check',
        status: 'warning',
        message: 'Title is quite short (less than 30 characters)',
        details: { length: article.title.length }
      });
    } else if (article.title.length > 60) {
      checks.push({
        id: 'seo_title_long',
        type: 'seo_check',
        status: 'warning',
        message: 'Title is quite long (more than 60 characters)',
        details: { length: article.title.length }
      });
    }

    // Check description length
    if (article.dek) {
      if (article.dek.length < 120) {
        checks.push({
          id: 'seo_description_short',
          type: 'seo_check',
          status: 'warning',
          message: 'Description is quite short (less than 120 characters)',
          details: { length: article.dek.length }
        });
      } else if (article.dek.length > 160) {
        checks.push({
          id: 'seo_description_long',
          type: 'seo_check',
          status: 'warning',
          message: 'Description is quite long (more than 160 characters)',
          details: { length: article.dek.length }
        });
      }
    }

    // Check for hero image
    if (!article.hero_url) {
      checks.push({
        id: 'seo_no_hero_image',
        type: 'seo_check',
        status: 'warning',
        message: 'No hero image - consider adding one for better social sharing',
        details: {}
      });
    }

    return checks;
  }

  static async generateQualityReport(articleId: number): Promise<QualityReport> {
    try {
      const article = await Database.query('SELECT * FROM articles WHERE id = $1', [articleId]);
      if (!article.rows[0]) {
        throw new Error('Article not found');
      }

      const citations = await Database.getCitationsByArticleId(articleId);
      const tags = await Database.getTagsByArticleId(articleId);

      const checks: QualityCheck[] = [];

      // Link validation
      const citationUrls = citations.map(c => c.url);
      if (citationUrls.length > 0) {
        const linkChecks = await this.validateLinks(citationUrls);
        checks.push(...linkChecks);
      }

      // Content analysis
      const contentChecks = this.analyzeContent(article.rows[0].body_html);
      checks.push(...contentChecks);

      // SEO analysis
      const seoChecks = this.analyzeSEO(article.rows[0]);
      checks.push(...seoChecks);

      // Calculate overall score
      const totalChecks = checks.length;
      const passedChecks = checks.filter(c => c.status === 'passed').length;
      const warningChecks = checks.filter(c => c.status === 'warning').length;
      const failedChecks = checks.filter(c => c.status === 'failed').length;

      const overallScore = totalChecks > 0 
        ? Math.round(((passedChecks + warningChecks * 0.5) / totalChecks) * 100)
        : 100;

      // Generate recommendations
      const recommendations: string[] = [];
      
      if (failedChecks > 0) {
        recommendations.push('Fix failed checks before publishing');
      }
      
      if (warningChecks > 0) {
        recommendations.push('Consider addressing warning items for better quality');
      }
      
      if (overallScore < 70) {
        recommendations.push('Overall quality score is low - review and improve content');
      }

      return {
        articleId,
        overallScore,
        checks,
        recommendations
      };

    } catch (error) {
      console.error('Failed to generate quality report:', error);
      throw error;
    }
  }

  static async runDailyQualityChecks(): Promise<void> {
    console.log('Running daily quality checks...');

    try {
      // Get articles that need review
      const needsReview = await Database.query(
        'SELECT * FROM articles WHERE review_status = \'needs_review\' ORDER BY created_at DESC LIMIT 10'
      );

      for (const article of needsReview.rows) {
        try {
          const report = await this.generateQualityReport(article.id);
          console.log(`Quality report for article ${article.id}: ${report.overallScore}%`);
          
          // Update review status based on score
          if (report.overallScore >= 80 && report.checks.every(c => c.status !== 'failed')) {
            await Database.query(
              'UPDATE articles SET review_status = \'reviewed\' WHERE id = $1',
              [article.id]
            );
            console.log(`Article ${article.id} auto-approved based on quality score`);
          }
        } catch (error) {
          console.error(`Failed to check article ${article.id}:`, error);
        }
      }

      console.log('Daily quality checks completed');
    } catch (error) {
      console.error('Daily quality checks failed:', error);
    }
  }
}

export default QualityControlService;
