# Aggressive Duplicate Prevention

## Problem
Articles were still duplicating despite previous fixes. The system needed more aggressive duplicate prevention.

## Solution
Implemented multi-layer aggressive duplicate prevention:

### 1. Complete Database Cleanup (`FastIngestService`)
- **Complete wipe**: Clear ALL `raw_items` before each new ingest
- **Fresh start**: Ensures no old data influences new article generation
- **Zero tolerance**: No accumulation of old items

```typescript
// Clear ALL old raw items before new ingest
const deletedCount = await Database.clearAllRawItems();
```

### 2. Database-Level Similarity Check (`ArticleGenerator`)
- **Pre-generation check**: Check for similar articles before generating new ones
- **7-day lookback**: Prevents similar articles within the last week
- **Smart matching**: Uses keyword extraction and regex patterns

```typescript
// Check for similar recent articles to avoid duplicates
const similarArticles = await Database.getSimilarArticles(selectedItem.title, 7);
if (similarArticles.length > 0) {
  console.log(`⚠️ Skipping article: Similar article found in last 7 days`);
  continue;
}
```

### 3. Enhanced Keyword Overlap Detection (`RankingService`)
- **Multi-level filtering**: Framework + Topic + Keyword overlap
- **Aggressive similarity**: Prevents any keyword overlap between articles
- **Comprehensive tracking**: Tracks all used keywords, not just frameworks

```typescript
// Check for keyword overlap (more aggressive similarity check)
const hasKeywordOverlap = allKeywords.some(keyword => 
  usedKeywords.has(keyword.toLowerCase())
);

// Skip if same framework, similar topic, OR keyword overlap
if (!hasUsedFramework && !isSimilar && !hasKeywordOverlap) {
  // Only then select the item
}
```

### 4. Smart Similarity Detection (`Database.getSimilarArticles`)
- **Keyword extraction**: Extracts meaningful words from titles
- **Multiple matching strategies**: Regex + LIKE patterns
- **Configurable lookback**: Adjustable time window for similarity checks

```typescript
// Extract key words from title for similarity check
const titleWords = title.toLowerCase()
  .replace(/[^a-z0-9\s]/g, '')
  .split(/\s+/)
  .filter(word => word.length > 3) // Only meaningful words
  .slice(0, 5); // Take first 5 words
```

## Prevention Layers

1. **Database Cleanup**: Complete wipe of old data
2. **Pre-generation Check**: Similarity check before article creation
3. **Selection Filtering**: Multi-level keyword overlap prevention
4. **Fallback Protection**: Same filtering in fallback selection

## Benefits
- **Zero Duplicates**: Multiple layers ensure no similar content
- **Fresh Content**: Complete data refresh each day
- **Quality Maintenance**: High-scoring, diverse content selection
- **Performance**: Efficient similarity detection

## Configuration
- **Database cleanup**: Complete wipe (configurable)
- **Similarity window**: 7 days (configurable)
- **Keyword filtering**: All keywords tracked
- **Fallback protection**: Same strict filtering

## Monitoring
The system now logs:
- Complete database cleanup results
- Similarity check results
- Keyword overlap detection
- Article skipping reasons

This aggressive approach ensures maximum content diversity and eliminates duplicate articles completely.
