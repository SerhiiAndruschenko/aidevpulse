# AIDevPulse

AI-powered blog that automatically generates analytical articles about the latest tech releases, updates, and breaking changes. Built with Next.js 15, PostgreSQL, and Google Gemini AI.

## Features

- 🤖 **AI-Generated Content**: Uses Google Gemini AI to create analytical articles
- 📅 **Daily Automation**: Automatic daily article generation via cron jobs
- 🔍 **Smart Data Ingestion**: Collects data from RSS feeds, GitHub releases, and npm packages
- 📊 **Quality Control**: Automated quality checks and validation
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS
- 🔍 **SEO Optimized**: Complete SEO setup with sitemaps, structured data, and meta tags
- 🏷️ **Tag System**: Organized content with tags and categories
- 📱 **Mobile Friendly**: Fully responsive design

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **AI**: Google Gemini AI
- **Deployment**: Vercel
- **Cron Jobs**: Vercel Cron

## Architecture

### Data Flow
1. **Ingest**: Daily collection of data from RSS feeds, GitHub releases, npm packages
2. **Rank**: AI-powered ranking and selection of the best content
3. **Generate**: Aiden Pulse and article generation using Gemini
4. **Quality Control**: Automated validation and quality checks
5. **Publish**: Automatic publishing with SEO optimization

### Database Schema
- `sources`: RSS feeds and API endpoints
- `items_raw`: Raw ingested data
- `articles`: Generated articles
- `citations`: Source links and references
- `tags`: Content categorization

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/ai_tech_blog

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Image Generation (optional)
IMAGE_API_KEY=your_image_api_key_here
IMAGE_API_URL=https://api.openai.com/v1/images/generations

# Site Configuration
SITE_URL=https://your-domain.com
SITE_NAME=AIDevPulse
SITE_DESCRIPTION=AI-powered analysis of the latest tech releases and updates

# Admin
ADMIN_EMAIL=admin@your-domain.com
CRON_SECRET=your_secret_key_for_cron_jobs
```

### 2. Database Setup

1. Create a PostgreSQL database
2. Run the migration script:
```bash
npm run db:migrate
```
3. Seed the database with initial sources:
```bash
npm run db:seed
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

### Cron Jobs
- `POST /api/cron/ingest` - Daily data ingestion (6:00 AM UTC)
- `POST /api/cron/generate-article` - Daily article generation (8:00 AM UTC)
- `POST /api/cron/quality-check` - Daily quality checks (10:00 AM UTC)

### Public Endpoints
- `GET /sitemap.xml` - XML sitemap
- `GET /rss.xml` - RSS feed
- `GET /articles/[slug]` - Individual article pages
- `GET /tags/[name]` - Tag pages

## Content Sources

The blog automatically ingests content from:

### Frameworks
- React, Next.js, Vue, Angular, Svelte
- Node.js, TypeScript, Vite, Bun, Deno

### Cloud & Infrastructure
- AWS, Azure, Google Cloud
- Vercel, Netlify

### AI/ML
- Google AI, OpenAI, Meta AI, Anthropic, Hugging Face

### Databases
- PostgreSQL, MySQL, Redis, MongoDB

## AI Article Generation

Articles are generated using a structured approach:

1. **Facts Pack**: Key information extracted from sources
2. **Aiden Pulse**: Gemini AI creates analytical content
3. **Quality Validation**: Automated checks for accuracy and quality
4. **SEO Optimization**: Meta tags, structured data, and sitemaps

### Article Structure
- Summary (150 words)
- What Changed
- Why It Matters
- Action Items
- Breaking Changes (if any)
- Code Snippets
- Citations

## Quality Control

Automated quality checks include:
- Link validation
- Content analysis (clichés, length, structure)
- Fact checking against source data
- SEO optimization
- Image validation

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy - cron jobs will be automatically configured

### Manual Deployment

```bash
npm run build
npm start
```

## Customization

### Adding New Sources

Edit `scripts/seed.js` to add new RSS feeds or GitHub repositories:

```javascript
const sources = [
  { name: 'New Source', kind: 'rss', url: 'https://example.com/feed.xml' },
  // ... existing sources
];
```

### Modifying AI Prompts

Edit `src/lib/ai.ts` to customize the AI generation prompts and validation rules.

### Styling

The blog uses Tailwind CSS. Customize styles in `src/app/globals.css` and component files.

## Monitoring

- Check Vercel function logs for cron job execution
- Monitor database for new articles and quality scores
- Use Google Search Console for SEO monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License

## Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code comments

---

**Note**: This is an AI-powered blog that generates content automatically. Always review generated content before publishing to ensure accuracy and quality.
