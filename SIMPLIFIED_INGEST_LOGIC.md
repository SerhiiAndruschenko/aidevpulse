# Simplified Ingest Logic with Smart Version Filtering

## Problem
1. System was clearing all `items_raw` before ingest, losing valuable data
2. Old releases were being published after newer ones (e.g., canary.29 after canary.31)
3. No intelligent version comparison for same frameworks

## Solution
Implemented simplified ingest logic with smart version filtering and intelligent cleanup.

### 1. Simplified Ingest Process (`FastIngestService`)

#### No Pre-Cleanup
- **Preserve existing data**: No longer clears all `items_raw` before ingest
- **Add only new items**: Checks for existing items before adding
- **Dual duplicate check**: Both hash and title+URL checking

```typescript
// Check if we already have this item
const existing = await Database.getRawItemByHash(hash);
if (existing) continue;

// Check if we already have this item by title and URL (additional check)
const existingByTitle = await Database.getRawItemByTitleAndUrl(item.title, item.link);
if (existingByTitle) continue;
```

#### Smart Duplicate Prevention
- **Hash-based checking**: Primary duplicate detection
- **Title+URL checking**: Secondary duplicate detection
- **Only new items added**: Prevents duplicate ingestion

### 2. Post-Generation Cleanup (`ArticleGenerator`)

#### Intelligent Cleanup Timing
- **After generation**: Cleanup happens after all articles are generated
- **Keep yesterday's data**: Only keeps last 1 day of `items_raw`
- **Preserve recent data**: Ensures fresh data for next day

```typescript
// Clean up old raw items after generation (keep only yesterday's items)
console.log('🧹 Cleaning old raw items (keeping only yesterday\'s items)...');
const deletedCount = await Database.clearOldRawItems(1); // Keep only last 1 day
console.log(`✅ Deleted ${deletedCount} old raw items`);
```

### 3. Smart Version Filtering (`RankingService`)

#### Version Date Tracking
- **Track version dates**: Maps frameworks to their publication dates
- **Prefer newer versions**: Skips older versions of same framework
- **Intelligent sorting**: Sorts by score, then by date

```typescript
const usedVersions = new Map<string, Date>(); // Track versions and their dates

// Check for older versions of the same framework
let isOlderVersion = false;
if (item.published_at && frameworkKeywords.length > 0) {
  for (const framework of frameworkKeywords) {
    const existingVersionDate = usedVersions.get(framework.toLowerCase());
    if (existingVersionDate && item.published_at < existingVersionDate) {
      isOlderVersion = true;
      break;
    }
  }
}
```

#### Enhanced Sorting Logic
- **Score first**: Primary sorting by relevance score
- **Date second**: Secondary sorting by publication date
- **Newer preferred**: When scores are equal, prefer newer items

```typescript
// Sort by score descending, then by published date descending
rankedItems.sort((a, b) => {
  if (b.score !== a.score) {
    return b.score - a.score;
  }
  // If scores are equal, prefer newer items
  if (a.published_at && b.published_at) {
    return b.published_at.getTime() - a.published_at.getTime();
  }
  return 0;
});
```

### 4. Database Enhancements (`Database`)

#### Additional Duplicate Detection
- **Title+URL method**: New method for comprehensive duplicate checking
- **Flexible checking**: Multiple ways to detect duplicates

```typescript
static async getRawItemByTitleAndUrl(title: string, url: string): Promise<RawItem | null> {
  const result = await pool.query(
    'SELECT * FROM items_raw WHERE title = $1 AND url = $2',
    [title, url]
  );
  return result.rows[0] || null;
}
```

## Benefits
- **Data Preservation**: Keeps valuable data between ingests
- **Smart Versioning**: Prevents old releases after new ones
- **Efficient Cleanup**: Cleans up after generation, not before
- **Better Quality**: Ensures only newest, most relevant content

## Workflow
1. **Ingest**: Add only new items to `items_raw`
2. **Rank**: Sort by score and date, filter older versions
3. **Generate**: Create articles from best candidates
4. **Cleanup**: Remove old `items_raw` (keep only yesterday)

## Configuration
- **Cleanup timing**: After generation completion
- **Data retention**: 1 day of `items_raw`
- **Version filtering**: Strict newer-version preference
- **Duplicate detection**: Hash + Title+URL checking

## Examples of Improved Behavior
- **Before**: canary.29 published after canary.31 (wrong order)
- **After**: canary.31 published, canary.29 skipped (correct order)
- **Before**: All data cleared before ingest (data loss)
- **After**: Only new data added, old data preserved (data retention)

## Monitoring
The system now logs:
- Ingest statistics (new vs existing items)
- Version filtering results
- Cleanup statistics
- Data preservation metrics

This ensures intelligent content management with proper version handling and data preservation.
