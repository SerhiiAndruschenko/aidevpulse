# Precise Duplicate Prevention

## Problem
The ultra-aggressive duplicate prevention was too sensitive, causing legitimate different articles to be skipped as "similar" when they were actually about completely different topics.

## Solution
Implemented precise duplicate prevention that focuses on meaningful similarity rather than broad keyword matching.

### 1. Precise Database Similarity Detection (`Database.getSimilarArticles`)

#### Meaningful Word Extraction
- **Filtered common words**: Removes stop words like "the", "and", "for", "with", etc.
- **Minimum word length**: 3+ characters for meaningful words only
- **Limited word count**: Only first 5 meaningful words for precision
- **Significant words focus**: Only first 3 most significant words for matching

```typescript
const titleWords = title.toLowerCase()
  .replace(/[^a-z0-9\s]/g, '')
  .split(/\s+/)
  .filter(word => word.length > 3)
  .filter(word => !['the', 'and', 'for', 'with', 'from', 'this', 'that', 'are', 'was', 'were', 'have', 'has', 'had', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall'].includes(word))
  .slice(0, 5);
```

#### Exact Word Matching
- **No partial matching**: Only exact word matches count
- **Minimum overlap requirement**: At least 2 significant words must overlap
- **Post-query filtering**: Additional validation to ensure real similarity

```typescript
// Only consider similar if at least 2 significant words overlap
const overlapCount = significantWords.filter((word: string) => 
  articleWords.some((articleWord: string) => articleWord === word)
).length;

return overlapCount >= 2;
```

### 2. Precise Session-Level Detection (`ArticleGenerator`)

#### Title Overlap Detection
- **Meaningful words only**: Filters out common words and short words
- **Exact matching**: Only exact word matches, not partial
- **Limited scope**: Only first 3 significant words

```typescript
const titleWords = normalizedTitle.split(/\s+/)
  .filter(word => word.length > 3)
  .filter(word => !['the', 'and', 'for', 'with', 'from', 'this', 'that', 'are', 'was', 'were', 'have', 'has', 'had', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall'].includes(word))
  .slice(0, 3);
```

#### Framework-Only Overlap Detection
- **Framework focus**: Only checks for framework/library overlap
- **Ignores general keywords**: Doesn't check topic keywords that might be too broad
- **Precise matching**: Only exact framework matches

```typescript
// Only check for framework overlap (not all keywords)
const hasFrameworkOverlap = frameworkKeywords.some(keyword => 
  usedTopics.has(keyword.toLowerCase())
);
```

### 3. Improved Tracking System

#### Framework-Only Tracking
- **Focused tracking**: Only tracks frameworks, not all keywords
- **Precise scope**: Avoids false positives from general terms
- **Better diversity**: Allows different topics about same general area

```typescript
// Mark frameworks and titles as used to avoid duplicates in this session
frameworkKeywords.forEach(keyword => usedTopics.add(keyword.toLowerCase()));
```

## Benefits
- **Precise Detection**: Only flags truly similar articles
- **Reduced False Positives**: Legitimate different articles are not skipped
- **Better Content Diversity**: Allows varied topics within same general area
- **Maintained Quality**: Still prevents actual duplicates

## Configuration
- **Word filtering**: Common words excluded from matching
- **Minimum overlap**: 2 significant words required for similarity
- **Framework focus**: Only framework/library overlap checked
- **Exact matching**: No partial word matching

## Examples of Improved Behavior
- **Before**: "Lenovo laptop" vs "Next.js release" = similar (false positive)
- **After**: "Lenovo laptop" vs "Next.js release" = different (correct)
- **Before**: "React v18" vs "React v19" = similar (correct)
- **After**: "React v18" vs "React v19" = similar (correct)

## Monitoring
The system now logs:
- Precise similarity detection results
- Framework-only overlap detection
- Meaningful word extraction
- Exact matching validation

This precise approach ensures only truly similar articles are prevented while allowing legitimate content diversity.
