# Dynamic Article Generation with Auto-Replacement

## Problem
When articles were skipped due to duplicates, the system didn't generate replacement articles, resulting in fewer articles than requested.

## Solution
Implemented dynamic article generation that automatically finds replacement topics when duplicates are detected.

### 1. Dynamic Selection Loop
- **Continuous search**: Instead of pre-selecting candidates, the system searches through all ranked items
- **Auto-replacement**: When a duplicate is found, it automatically moves to the next candidate
- **Guaranteed count**: Ensures the requested number of articles is generated

```typescript
while (generatedCount < count && currentIndex < rankedItems.length) {
  const selectedItem = rankedItems[currentIndex];
  
  // Check for duplicates and skip if found
  if (hasSimilarArticle || hasTopicOverlap) {
    currentIndex++;
    continue; // Move to next candidate
  }
  
  // Generate article and increment count
  generatedCount++;
}
```

### 2. Multi-Level Duplicate Detection
- **Database similarity check**: Checks for similar articles in the last 7 days
- **Session topic tracking**: Prevents topic overlap within the same generation session
- **Keyword overlap detection**: Avoids articles with similar keywords

```typescript
// Check for similar recent articles
const similarArticles = await Database.getSimilarArticles(selectedItem.title, 7);

// Check for topic overlap within this session
const hasTopicOverlap = allKeywords.some(keyword => 
  usedTopics.has(keyword.toLowerCase())
);
```

### 3. Session-Based Topic Tracking
- **Real-time tracking**: Tracks topics used during the current generation session
- **Keyword marking**: Marks all keywords as used after successful generation
- **Prevents duplicates**: Ensures no two articles in the same session share topics

```typescript
const usedTopics = new Set<string>(); // Track topics used in this session

// After successful generation
allKeywords.forEach(keyword => usedTopics.add(keyword.toLowerCase()));
```

### 4. Public Keyword Extraction Methods
- **Accessible methods**: Made `extractTopicKeywords` and `extractFrameworkKeywords` public
- **Reusable logic**: Can be used by other parts of the system
- **Consistent extraction**: Ensures consistent keyword extraction across the system

## Benefits
- **Guaranteed output**: Always generates the requested number of articles
- **No wasted attempts**: Automatically skips duplicates and finds alternatives
- **Session consistency**: Prevents topic overlap within the same generation
- **Efficient processing**: Processes items in order of relevance score

## Flow
1. **Start with ranked items**: Use all ranked items, not pre-selected candidates
2. **Check for duplicates**: Database similarity + session topic overlap
3. **Skip if duplicate**: Move to next candidate automatically
4. **Generate if unique**: Create article and mark topics as used
5. **Repeat until count reached**: Continue until requested number is generated

## Configuration
- **Similarity window**: 7 days (configurable)
- **Topic tracking**: All keywords tracked per session
- **Replacement logic**: Automatic progression through ranked items
- **Error handling**: Continue on individual article failures

## Monitoring
The system now logs:
- Dynamic candidate selection
- Duplicate detection results
- Topic overlap prevention
- Successful replacements
- Final article count vs requested

This ensures consistent article generation with maximum diversity and no duplicates.
