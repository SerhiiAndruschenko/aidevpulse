# Duplicate Article Prevention

## Problem
Articles were being generated on the same topics for multiple days in a row, leading to repetitive content.

## Solution
Implemented comprehensive duplicate prevention at multiple levels:

### 1. Database Cleanup (`FastIngestService`)
- **Automatic cleanup**: Before each new ingest, old `raw_items` are cleared (keeping only last 1 day)
- **Prevents accumulation**: Stops thousands of old items from being considered for new articles
- **Fresh data**: Ensures only recent, relevant content is available for article generation

```typescript
// Always clear old raw items before new ingest to prevent duplicate topics
console.log('🧹 Clearing old raw items before new ingest...');
const deletedCount = await Database.clearOldRawItems(1); // Keep only last 1 day
```

### 2. Enhanced Topic Diversification (`RankingService`)
- **Framework tracking**: Prevents multiple articles about the same framework/library
- **Title deduplication**: Avoids exact title matches
- **Topic similarity**: Filters out similar topics within the same batch

#### New Methods:
- `extractFrameworkKeywords()`: Identifies frameworks/libraries in content
- Enhanced `selectTopCandidates()`: Multi-level filtering for diversity

#### Framework List:
```typescript
const frameworkList = [
  'react', 'nextjs', 'vue', 'angular', 'svelte', 
  'nodejs', 'typescript', 'javascript', 'python', 
  'rust', 'go', 'openai', 'gemini', 'claude'
];
```

### 3. Selection Logic
The system now uses a three-tier filtering approach:

1. **Primary Selection**: 
   - Skip exact title duplicates
   - Skip same framework/library
   - Skip similar topics

2. **Fallback Selection**:
   - If not enough diverse items, fill remaining slots
   - Still apply framework and title deduplication

3. **Quality Assurance**:
   - Ensure minimum 3 diverse articles
   - Prioritize recent, high-quality content

## Benefits
- **Content Diversity**: Each day gets unique, varied articles
- **Framework Balance**: No multiple articles about the same technology
- **Fresh Content**: Only recent, relevant data is considered
- **Quality Maintenance**: High-scoring, diverse content selection

## Configuration
- **Database cleanup**: 1 day retention (configurable)
- **Article count**: 3 articles per day
- **Framework tracking**: Comprehensive list of major technologies
- **Similarity threshold**: Strict matching to prevent duplicates

## Monitoring
The system logs:
- Number of old items deleted
- Framework diversity in selection
- Topic keywords extracted
- Final article selection with reasons

This ensures each day produces unique, valuable content for developers.
