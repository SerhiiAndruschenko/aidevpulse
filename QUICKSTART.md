# 🚀 Quick Start Guide

This guide will help you get the AIDevPulse up and running in minutes.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- Google Gemini API key

## 1. Clone and Install

```bash
git clone <your-repo-url>
cd ai-tech-blog
npm install
```

## 2. Environment Setup

Create `.env.local` file:

```env
# Database (required)
DATABASE_URL=postgresql://username:password@localhost:5432/ai_tech_blog

# AI (required)
GEMINI_API_KEY=your_gemini_api_key_here

# Site (optional)
SITE_URL=http://localhost:3000
SITE_NAME=AIDevPulse
SITE_DESCRIPTION=AI-powered tech analysis
```

## 3. Database Setup

```bash
# Create database tables
npm run db:migrate

# Add initial data sources
npm run db:seed
```

## 4. Test System

```bash
# Check if everything is working
npm run test:system
```

## 5. Start Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 6. Test Article Generation

### Manual Testing

```bash
# Test data ingestion
curl -X POST http://localhost:3000/api/cron/ingest

# Test article generation
curl -X POST http://localhost:3000/api/cron/generate-article
```

### Check Results

- Visit the homepage to see generated articles
- Check `/tags` for available tags
- View `/rss.xml` for RSS feed

## 7. Production Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

Cron jobs will be automatically configured.

### Manual Deployment

```bash
npm run build
npm start
```

## Troubleshooting

### Database Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Run `npm run db:migrate` again

### AI Generation Issues
- Verify GEMINI_API_KEY is correct
- Check API quotas and limits
- Review console logs for errors

### No Articles Generated
- Check if sources are active in database
- Verify cron jobs are running
- Test manual API calls

## Next Steps

1. **Customize Sources**: Edit `scripts/seed.js` to add your preferred RSS feeds
2. **Modify AI Prompts**: Update `src/lib/ai.ts` for different content style
3. **Add Image Generation**: Integrate DALL-E or other image APIs
4. **Monitor Quality**: Check quality scores and adjust validation rules

## Support

- Check the main README.md for detailed documentation
- Review code comments for implementation details
- Create GitHub issues for bugs or questions

---

**Happy blogging! 🤖📝**
