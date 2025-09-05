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
    const systemPrompt = `You are a senior dev/AI editor. Write an ORIGINAL analytical article from official release notes. Do not paraphrase sentences; synthesize and add value.

Return STRICT JSON in this exact format:
{
  "headline": "...",
  "dek": "...",
  "body_sections": {
    "summary_150w": "...",
    "what_changed": ["...","..."],
    "why_it_matters": ["...","...","..."],
    "actions": ["upgrade command ...","check migration ..."],
    "breaking_changes": ["..."]
  },
  "code_snippet": {"lang":"bash","title":"Upgrade","code":"npx @next/codemod ..."},
  "citations": [{"url":"...","title":"..."},{"url":"..."}],
  "tags": ["nextjs","release","react","web"]
}

Rules:
- Add concrete commands and file names when possible.
- Cite ONLY official links. No invented claims.
- If a fact is uncertain, omit it.
- Write in ${factsPack.language || 'English'}.
- Target audience: ${factsPack.audience || 'experienced web developers'}.`;

    const userInput = `Analyze this release and create an analytical article:

Topic: ${factsPack.topic}
Date: ${factsPack.key_facts.date}
Version: ${factsPack.key_facts.version}
Highlights: ${factsPack.key_facts.highlights.join(', ')}
Risks: ${factsPack.key_facts.risk.join(', ')}
Ecosystem: ${factsPack.key_facts.ecosystem.join(', ')}

Sources:
${factsPack.sources.map((s: any) => `- ${s.title}: ${s.url}`).join('\n')}

Key Facts:
${JSON.stringify(factsPack.key_facts, null, 2)}`;

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
      
      // Validate required fields
      if (!articleContent.headline || !articleContent.body_sections) {
        throw new Error('Invalid article structure from AI');
      }

      return articleContent;
    } catch (error) {
      console.error('Failed to generate article:', error);
      throw error;
    }
  }

  static async generateImagePrompt(topic: string): Promise<ImagePrompt> {
    const prompt = `Create a concise image prompt for a 1200x630 cover.
Style: minimal, tech editorial, dark background, geometric shapes.
Subject: "${topic}", include abstract elements (framework logo style but not trademarked logos).
No text in image. Return plain text.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const imagePrompt = response.text().trim();

      return {
        prompt: imagePrompt,
        style: 'minimal, tech editorial, dark background, geometric shapes'
      };
    } catch (error) {
      console.error('Failed to generate image prompt:', error);
      // Fallback prompt
      return {
        prompt: `Minimal tech illustration with geometric shapes on dark background, representing ${topic}`,
        style: 'minimal, tech editorial, dark background, geometric shapes'
      };
    }
  }

  static async validateArticle(article: ArticleContent, factsPack: any): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    // Check required fields
    if (!article.headline || article.headline.length < 10) {
      issues.push('Headline too short or missing');
    }

    if (!article.dek || article.dek.length < 20) {
      issues.push('Dek (subtitle) too short or missing');
    }

    if (!article.body_sections.summary_150w || article.body_sections.summary_150w.length < 50) {
      issues.push('Summary too short or missing');
    }

    if (article.body_sections.what_changed.length === 0) {
      issues.push('No "what changed" items');
    }

    if (article.body_sections.why_it_matters.length === 0) {
      issues.push('No "why it matters" items');
    }

    // Check citations
    if (article.citations.length === 0) {
      issues.push('No citations provided');
    }

    // Validate citations against facts pack
    for (const citation of article.citations) {
      const isValidSource = factsPack.sources.some((s: any) => 
        s.url === citation.url || citation.url.includes(s.url)
      );
      if (!isValidSource) {
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
