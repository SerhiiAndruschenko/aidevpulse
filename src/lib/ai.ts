import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface ArticleContent {
  headline: string;
  dek: string;
  body_sections: {
    summary_150w: string;
    what_changed: string[];
    why_it_matters: string[];
    actions: string[];
    breaking_changes: string[];
  };
  code_snippet?: {
    lang: string;
    title: string;
    code: string;
  };
  citations: Array<{
    url: string;
    title: string;
  }>;
  tags: string[];
}

export interface ImagePrompt {
  prompt: string;
  style: string;
}

export class AIService {
  private static model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  static async generateArticle(factsPack: any): Promise<ArticleContent> {
    const systemPrompt = `You are a senior software engineer and technical writer with 10+ years of experience. Write a comprehensive, expert-level analysis article that provides deep technical insights, not just surface-level information.

CRITICAL REQUIREMENTS:
- Write with authority and expertise - you're speaking to fellow senior developers
- Provide specific technical details, not generic statements
- Include concrete examples, code snippets, and actionable insights
- Analyze the IMPACT and IMPLICATIONS, not just what changed
- Add your expert opinion on what this means for the ecosystem
- Use precise technical language and avoid fluff

Return STRICT JSON in this exact format:
{
  "headline": "Compelling, specific headline that captures the technical significance",
  "dek": "Detailed subtitle explaining the broader impact and context",
  "body_sections": {
    "summary_150w": "Comprehensive summary with specific technical details and implications",
    "what_changed": [
      "Specific technical change 1 with concrete details",
      "Specific technical change 2 with version numbers/APIs",
      "Specific technical change 3 with performance metrics if available"
    ],
    "why_it_matters": [
      "Technical impact on development workflow with specific examples",
      "Performance implications with concrete numbers if available", 
      "Ecosystem implications and how it affects related tools",
      "Long-term strategic implications for the technology"
    ],
    "actions": [
      "Specific upgrade command with exact syntax",
      "Migration steps with file names and code examples",
      "Testing recommendations with specific tools/commands",
      "Monitoring/validation steps post-upgrade"
    ],
    "breaking_changes": [
      "Specific breaking change 1 with migration path",
      "Specific breaking change 2 with code examples",
      "Specific breaking change 3 with impact assessment"
    ]
  },
  "code_snippet": {
    "lang": "javascript|bash|typescript|json",
    "title": "Specific title describing the code example",
    "code": "Actual working code example with comments"
  },
  "citations": [
    {"url": "official source URL", "title": "Official documentation title"},
    {"url": "release notes URL", "title": "Release notes title"}
  ],
  "tags": ["framework-name", "release", "breaking-changes", "performance", "migration"]
}

EXPERT WRITING GUIDELINES:
- Start with the technical significance, not generic statements
- Use specific version numbers, API names, and technical terms
- Provide concrete examples and code snippets
- Explain the "why" behind changes, not just the "what"
- Include performance metrics, benchmarks, or technical specifications when available
- Address potential gotchas, edge cases, or migration challenges
- Write in ${factsPack.language || 'English'} for ${factsPack.audience || 'senior developers and technical leads'}

AVOID:
- Generic statements like "this is important" or "developers should know"
- Vague descriptions without technical details
- Marketing language or promotional tone
- Empty bullet points or placeholder text
- Null values or empty arrays - always provide meaningful content`;

    const userInput = `Create an expert technical analysis article based on this release information:

RELEASE DETAILS:
Topic: ${factsPack.topic}
Release Date: ${factsPack.key_facts.date}
Version: ${factsPack.key_facts.version || 'Latest'}
Highlights: ${factsPack.key_facts.highlights.join(', ') || 'New features and improvements'}
Breaking Changes: ${factsPack.key_facts.risk.join(', ') || 'None specified'}
Ecosystem Impact: ${factsPack.key_facts.ecosystem.join(', ') || 'General web development'}

OFFICIAL SOURCES:
${factsPack.sources.map((s: any) => `- ${s.title}: ${s.url}`).join('\n')}

DETAILED RELEASE DATA:
${JSON.stringify(factsPack.key_facts, null, 2)}

ANALYSIS REQUIREMENTS:
1. Focus on technical implementation details and specific changes
2. Provide concrete examples and code snippets where applicable
3. Explain the practical impact on development workflows
4. Include specific upgrade/migration instructions
5. Address potential challenges or gotchas
6. Provide expert insights on ecosystem implications
7. Use precise technical language throughout

Write as if you're briefing a team of senior developers who need to understand the technical significance and plan their upgrade strategy.`;

    try {
      const result = await this.model.generateContent([systemPrompt, userInput]);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const articleContent = JSON.parse(jsonMatch[0]);
      
      // Clean up null values and ensure proper structure
      const cleanedContent = this.cleanArticleContent(articleContent);
      
      // Validate required fields
      if (!cleanedContent.headline || !cleanedContent.body_sections) {
        throw new Error('Invalid article structure from AI');
      }

      return cleanedContent;
    } catch (error) {
      console.error('Failed to generate article:', error);
      throw error;
    }
  }

  private static cleanArticleContent(content: any): ArticleContent {
    // Clean up null values and ensure proper structure
    const cleaned = {
      headline: content.headline || 'Technical Release Update',
      dek: content.dek || 'Important updates and changes for developers',
      body_sections: {
        summary_150w: content.body_sections?.summary_150w || 'Technical summary of the release',
        what_changed: this.cleanArray(content.body_sections?.what_changed) || ['New features and improvements'],
        why_it_matters: this.cleanArray(content.body_sections?.why_it_matters) || ['Important for development workflow'],
        actions: this.cleanArray(content.body_sections?.actions) || ['Review release notes and plan upgrade'],
        breaking_changes: this.cleanArray(content.body_sections?.breaking_changes) || []
      },
      code_snippet: content.code_snippet || null,
      citations: this.cleanCitations(content.citations) || [],
      tags: this.cleanArray(content.tags) || ['release', 'update']
    };

    return cleaned;
  }

  private static cleanArray(arr: any[]): string[] {
    if (!Array.isArray(arr)) return [];
    return arr
      .filter(item => item !== null && item !== undefined && item !== 'null' && item.trim() !== '')
      .map(item => String(item).trim());
  }

  private static cleanCitations(arr: any[]): Array<{url: string, title: string}> {
    if (!Array.isArray(arr)) return [];
    return arr
      .filter(item => item !== null && item !== undefined && item !== 'null')
      .map(item => ({
        url: item.url || item,
        title: item.title || item.url || 'Source'
      }));
  }

  static async generateImagePrompt(topic: string): Promise<ImagePrompt> {
    // Skip image generation to reduce API calls
    // Return a simple fallback prompt without making API call
    return {
      prompt: `Minimal tech illustration with geometric shapes on dark background, representing ${topic}`,
      style: 'minimal, tech editorial, dark background, geometric shapes'
    };
  }

  static async validateArticle(article: ArticleContent, factsPack: any): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    // Check for null values
    if (article.headline === null || article.headline === undefined || article.headline === 'null') {
      issues.push('Headline is null or undefined');
    } else if (article.headline.length < 15) {
      issues.push('Headline too short (minimum 15 characters)');
    }

    if (article.dek === null || article.dek === undefined || article.dek === 'null') {
      issues.push('Dek (subtitle) is null or undefined');
    } else if (article.dek.length < 30) {
      issues.push('Dek too short (minimum 30 characters)');
    }

    if (!article.body_sections || article.body_sections === null) {
      issues.push('Body sections is null or undefined');
    } else {
      if (article.body_sections.summary_150w === null || article.body_sections.summary_150w === 'null') {
        issues.push('Summary is null or undefined');
      } else if (article.body_sections.summary_150w.length < 100) {
        issues.push('Summary too short (minimum 100 characters)');
      }

      if (!article.body_sections.what_changed || article.body_sections.what_changed.length === 0) {
        issues.push('No "what changed" items');
      } else {
        // Check for null items in arrays
        const nullItems = article.body_sections.what_changed.filter(item => 
          item === null || item === undefined || item === 'null' || item.trim() === ''
        );
        if (nullItems.length > 0) {
          issues.push(`Found ${nullItems.length} null/empty items in "what_changed"`);
        }
      }

      if (!article.body_sections.why_it_matters || article.body_sections.why_it_matters.length === 0) {
        issues.push('No "why it matters" items');
      } else {
        const nullItems = article.body_sections.why_it_matters.filter(item => 
          item === null || item === undefined || item === 'null' || item.trim() === ''
        );
        if (nullItems.length > 0) {
          issues.push(`Found ${nullItems.length} null/empty items in "why_it_matters"`);
        }
      }

      if (!article.body_sections.actions || article.body_sections.actions.length === 0) {
        issues.push('No "actions" items');
      } else {
        const nullItems = article.body_sections.actions.filter(item => 
          item === null || item === undefined || item === 'null' || item.trim() === ''
        );
        if (nullItems.length > 0) {
          issues.push(`Found ${nullItems.length} null/empty items in "actions"`);
        }
      }
    }

    // Check citations
    if (article.citations.length === 0) {
      issues.push('No citations provided');
    }

    // Validate citations against facts pack and official domains
    const officialDomains = [
      'github.com', 'developer.apple.com', 'docs.microsoft.com', 'developers.google.com',
      'reactjs.org', 'nextjs.org', 'vuejs.org', 'angular.io', 'nodejs.org', 'typescriptlang.org',
      'openai.com', 'anthropic.com', 'huggingface.co', 'vercel.com', 'netlify.com'
    ];
    
    for (const citation of article.citations) {
      const isValidSource = factsPack.sources.some((s: any) => 
        s.url === citation.url || citation.url.includes(s.url)
      );
      
      const isOfficialDomain = officialDomains.some(domain => 
        citation.url.includes(domain)
      );
      
      if (!isValidSource && !isOfficialDomain) {
        issues.push(`Citation not from official sources: ${citation.url}`);
      }
    }

    // Check for forbidden patterns
    const forbiddenPatterns = [
      'as we all know',
      'in today\'s world',
      'it\'s no secret',
      'everyone knows',
      'obviously',
      'clearly',
      'undoubtedly'
    ];

    const fullText = `${article.headline} ${article.dek} ${JSON.stringify(article.body_sections)}`.toLowerCase();
    for (const pattern of forbiddenPatterns) {
      if (fullText.includes(pattern)) {
        issues.push(`Forbidden pattern detected: "${pattern}"`);
      }
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  static async generateHeroImage(imagePrompt: ImagePrompt): Promise<string | null> {
    try {
      // Import the image generation service
      const { ImageGenerationService } = await import('./image-generation');
      
      const result = await ImageGenerationService.generateHeroImage(imagePrompt.prompt, {
        width: 1200,
        height: 630,
        style: imagePrompt.style
      });
      
      return result?.url || null;
    } catch (error) {
      console.error('Failed to generate hero image:', error);
      return null;
    }
  }
}

export default AIService;
