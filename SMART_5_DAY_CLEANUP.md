# Smart 5-Day Cleanup System

## Problem
Need to implement automatic cleanup of `items_raw` table every 5 days, removing data from 5 days ago, without using separate cron jobs.

## Solution
Implemented a smart cleanup system using a counter stored in the database that tracks days and triggers cleanup every 5 days.

### 1. Database Schema (`system_settings` table)

#### Table Structure
```sql
CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(255) PRIMARY KEY,
  value INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Purpose
- **Counter storage**: Stores cleanup counter value
- **Automatic creation**: Table created automatically if not exists
- **Key-value system**: Flexible for future system settings

### 2. Database Methods (`Database` class)

#### Counter Management
```typescript
// Get current cleanup counter
static async getCleanupCounter(): Promise<number>

// Increment counter and return new value
static async incrementCleanupCounter(): Promise<number>

// Reset counter to 0
static async resetCleanupCounter(): Promise<void>
```

#### Smart Cleanup
```typescript
// Clean items from specific date range (5-day window)
static async clearRawItemsByDateRange(daysBack: number): Promise<number>
```

#### Example Usage
```typescript
// Clean items from 5-10 days ago
const deletedCount = await Database.clearRawItemsByDateRange(5);
```

### 3. Cleanup Logic (`ArticleGenerator`)

#### Smart Cleanup Method
```typescript
private static async performSmartCleanup(): Promise<void> {
  // Get current counter
  const currentCounter = await Database.getCleanupCounter();
  
  // Increment counter
  const newCounter = await Database.incrementCleanupCounter();
  
  // If counter reaches 5, perform cleanup
  if (newCounter >= 5) {
    // Clean up 5-day old data
    const deletedCount = await Database.clearRawItemsByDateRange(5);
    
    // Reset counter
    await Database.resetCleanupCounter();
  }
}
```

#### Integration
- **After generation**: Called after all articles are generated
- **Automatic**: No manual intervention required
- **Logged**: Full logging of cleanup process

### 4. Cleanup Schedule

#### Timeline Example
- **Day 1**: Counter = 1, no cleanup
- **Day 2**: Counter = 2, no cleanup  
- **Day 3**: Counter = 3, no cleanup
- **Day 4**: Counter = 4, no cleanup
- **Day 5**: Counter = 5, cleanup items from 5-10 days ago, reset counter

#### Date Range Logic
- **September 10**: Clean items from September 1-5
- **September 15**: Clean items from September 5-10
- **September 20**: Clean items from September 10-15

### 5. SQL Queries

#### Date Range Cleanup
```sql
DELETE FROM items_raw 
WHERE created_at >= NOW() - INTERVAL '10 days' 
AND created_at < NOW() - INTERVAL '5 days'
```

#### Counter Operations
```sql
-- Get counter
SELECT value FROM system_settings WHERE key = 'cleanup_counter';

-- Increment counter
INSERT INTO system_settings (key, value) 
VALUES ('cleanup_counter', 1) 
ON CONFLICT (key) 
DO UPDATE SET value = system_settings.value + 1, updated_at = NOW()
RETURNING value;

-- Reset counter
UPDATE system_settings SET value = 0, updated_at = NOW() 
WHERE key = 'cleanup_counter';
```

### 6. Benefits

#### Automatic Management
- **No cron jobs**: Uses existing article generation process
- **Self-managing**: Counter automatically tracks days
- **Efficient**: Only cleans when needed

#### Data Preservation
- **5-day window**: Keeps recent data for analysis
- **Gradual cleanup**: Removes old data systematically
- **No data loss**: Preserves current and recent data

#### Performance
- **Batch cleanup**: Removes large amounts of old data
- **Database efficiency**: Reduces table size over time
- **Memory optimization**: Prevents unlimited growth

### 7. Monitoring

#### Logging
```
📊 Current cleanup counter: 3
📊 New cleanup counter: 4
⏳ Cleanup in 1 days
```

#### Cleanup Execution
```
📊 Current cleanup counter: 4
📊 New cleanup counter: 5
🧹 Performing 5-day cleanup cycle...
✅ Deleted 1247 items from 5 days ago
🔄 Cleanup counter reset to 0
📊 Remaining items in database: 342
```

### 8. Configuration

#### Customizable Parameters
- **Cleanup interval**: 5 days (configurable)
- **Data retention**: 5-day window (configurable)
- **Counter key**: 'cleanup_counter' (configurable)

#### Future Extensions
- **Multiple counters**: Different cleanup schedules
- **Settings management**: Admin interface for counters
- **Cleanup policies**: Different retention policies

### 9. Error Handling

#### Robust Implementation
- **Table creation**: Automatic table creation if missing
- **Error logging**: Comprehensive error handling
- **Graceful failure**: Cleanup failures don't break generation

#### Recovery
- **Counter reset**: Manual counter reset if needed
- **Data integrity**: Cleanup doesn't affect current data
- **Rollback safe**: No data loss on failures

## Usage

The system works automatically:
1. **Daily generation**: Counter increments each day
2. **5-day cycle**: Cleanup triggers every 5 days
3. **Data management**: Old data removed systematically
4. **Continuous operation**: No manual intervention required

This ensures efficient database management while preserving recent data for analysis and preventing unlimited growth of the `items_raw` table.
