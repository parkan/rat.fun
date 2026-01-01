# Claude Development Guidelines for rat.fun

This document contains important guidelines for Claude Code when working on the rat.fun codebase.

## Logging Best Practices

### ⚠️ NEVER use console.log() directly in production code

Using `console.log()` with object references can cause **memory leaks** when browser DevTools are open, as the browser retains references to logged objects indefinitely. This is especially problematic when logging large data structures like entity collections, trip data, or outcome arrays.

### ✅ ALWAYS use the custom logger utility

The project provides a conditional logger that prevents memory leaks in production builds.

**Location:** `packages/client/src/lib/modules/logger/index.ts`

### Usage Examples

#### 1. Create a namespaced logger for your module

```typescript
import { createLogger } from "$lib/modules/logger"

const logger = createLogger("[MyModule]")
```

#### 2. Use logger methods instead of console.\*

```typescript
// ❌ DON'T DO THIS - causes memory leaks
console.log("[MyModule] Loading data:", { trips, outcomes, entities })

// ✅ DO THIS - safe and controlled
logger.log("Loading data:", {
  tripCount: trips.length,
  outcomeCount: outcomes.length
})
```

#### 3. Available log levels

```typescript
logger.log(...)    // General logging (disabled in production)
logger.info(...)   // Informational messages (disabled in production)
logger.debug(...)  // Debug messages (disabled in production)
logger.warn(...)   // Warnings (disabled in production)
logger.error(...)  // Errors (ALWAYS logged, even in production)
```

### Best Practices

1. **Avoid logging entire objects** - Log counts, IDs, or summaries instead

   ```typescript
   // ❌ Bad - logs entire entity collection
   logger.log("Entities:", allEntities)

   // ✅ Good - logs metadata only
   logger.log("Entities loaded:", {
     count: Object.keys(allEntities).length,
     hasPlayer: !!allEntities[playerId]
   })
   ```

2. **Use descriptive namespaces** - Makes filtering logs easier

   ```typescript
   const logger = createLogger("[CMS]") // Content Management
   const logger = createLogger("[ChainSync]") // Blockchain sync
   const logger = createLogger("[WalletNetwork]") // Wallet operations
   ```

3. **Errors should always be logged** - Use `logger.error()` for exceptions

   ```typescript
   try {
     await riskyOperation()
   } catch (error) {
     logger.error("Operation failed:", error) // Always logged
   }
   ```

4. **Toggle logging at runtime** - For debugging

   ```typescript
   import { setLoggingEnabled } from "$lib/modules/logger"

   // Enable verbose logging for debugging
   setLoggingEnabled(true)
   ```

## Memory Leak Prevention

### Event Listeners

Always clean up event listeners to prevent memory leaks:

```typescript
// ✅ Good - cleanup in effect return
$effect(() => {
  window.addEventListener("resize", handler)

  return () => {
    window.removeEventListener("resize", handler)
  }
})

// ✅ Good - export cleanup function for module-level listeners
export function cleanup() {
  window.removeEventListener("resize", handler)
}
```

### Cache Management

Use proper eviction strategies for caches:

```typescript
// ✅ Good - LRU cache with size limit
const cache = new Map<string, CacheEntry>()
const MAX_SIZE = 10

function addToCache(key: string, value: any) {
  // Evict oldest entry if cache is full
  if (cache.size >= MAX_SIZE) {
    const oldestKey = findOldestEntry(cache)
    cache.get(oldestKey)?.cleanup() // Clean up resources
    cache.delete(oldestKey)
  }
  cache.set(key, value)
}
```

## Module Structure

When working in `packages/client/src/lib/modules/`:

- Each module should export a cleanup function if it maintains state
- Use the logger utility for all logging
- Document memory management in comments
- Consider using WeakMap/WeakSet for auto-cleanup where appropriate

## Testing Your Changes

Before submitting code:

1. Check that no `console.log()` calls remain (except in error handlers)
2. Verify cleanup functions are called on component/module unmount
3. Test with browser DevTools open to ensure no memory retention
4. Use the browser's Memory profiler to check for leaks in long-running sessions

---

**Remember:** Memory leaks accumulate over time. A small leak in frequently-called code can cause significant performance degradation in production.
