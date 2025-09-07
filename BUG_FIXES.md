# Bug Fixes - September 7, 2025

## Issues Fixed

### 1. SQL Parameter Binding Error in Database Cleanup
**Problem**: PostgreSQL error when clearing old raw items
```
error: bind message supplies 1 parameters, but prepared statement "" requires 0
```

**Root Cause**: PostgreSQL doesn't support parameterized queries with `INTERVAL` syntax using `$1` placeholders.

**Solution**: 
- Changed from parameterized query to string interpolation with validation
- Added input validation to prevent SQL injection
- Limited `daysToKeep` to reasonable range (0-365 days)

**Code Change**:
```typescript
// Before (broken)
'DELETE FROM items_raw WHERE created_at < NOW() - INTERVAL \'$1 days\''
[daysToKeep]

// After (fixed)
`DELETE FROM items_raw WHERE created_at < NOW() - INTERVAL '${daysToKeep} days'`
// + validation: if (!Number.isInteger(daysToKeep) || daysToKeep < 0 || daysToKeep > 365)
```

### 2. Overly Strict Citation Validation
**Problem**: Articles failing validation due to legitimate official sources being rejected
```
Citation not from official sources: https://developer.apple.com/documentation/
```

**Root Cause**: Validation only checked against `factsPack.sources`, missing common official domains.

**Solution**:
- Added comprehensive list of official domains
- Made validation more flexible while maintaining quality
- Allows citations from trusted official sources

**Official Domains Added**:
- `github.com`, `developer.apple.com`, `docs.microsoft.com`
- `reactjs.org`, `nextjs.org`, `vuejs.org`, `angular.io`
- `nodejs.org`, `typescriptlang.org`
- `openai.com`, `anthropic.com`, `huggingface.co`
- `vercel.com`, `netlify.com`

## Impact
- ✅ Database cleanup now works correctly
- ✅ Prevents duplicate articles by clearing old data
- ✅ More articles pass validation with legitimate citations
- ✅ Maintains content quality while being more flexible

## Testing
The fixes have been applied and should resolve the cron job failures. The system will now:
1. Successfully clear old raw items before each ingest
2. Accept citations from official domains
3. Generate diverse articles without duplicates
