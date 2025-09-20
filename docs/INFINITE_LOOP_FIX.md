# React Infinite Loop Fix - Dashboard useEffect

## Problem
```
Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.
```

## Root Cause
The `actions` object from `useQuizStore()` was being recreated on every render, causing the `useEffect` in the dashboard to run infinitely:

```typescript
// PROBLEMATIC CODE
useEffect(() => {
  actions.loadQuizzes();
}, [actions]); // actions object changes every render
```

## Solutions Applied

### 1. Empty Dependency Array (Quick Fix)
```typescript
// FIXED - Run only once on mount
useEffect(() => {
  stableActions.loadQuizzes().catch((error) => {
    console.error('Failed to load quizzes:', error);
  });
}, []); // Only run once
```

### 2. useCallback in Store (Robust Fix)
```typescript
// Added to useQuizStore.tsx
const loadQuizzes = useCallback(async (): Promise<void> => {
  // ... implementation
}, []); // Stable reference
```

### 3. Stable Actions Hook (Best Practice)
```typescript
// Created useStableQuizActions.ts
export function useStableQuizActions() {
  const { actions } = useQuizStore();

  const stableLoadQuizzes = useCallback(() => {
    return actions.loadQuizzes();
  }, []);

  return {
    loadQuizzes: stableLoadQuizzes,
    // ... other stable actions
  };
}
```

## Usage in Components
```typescript
// IN DASHBOARD
export default function Dashboard() {
  const { state } = useQuizStore();
  const stableActions = useStableQuizActions(); // Stable references

  useEffect(() => {
    stableActions.loadQuizzes().catch(console.error);
  }, [stableActions.loadQuizzes]); // Won't cause infinite loops
}
```

## Prevention Guidelines

### DO
- Use `useCallback` for functions that are dependencies
- Use `useMemo` for objects that are dependencies
- Create stable action hooks for complex stores
- Use empty dependency arrays when appropriate

### DON'T
- Put non-memoized objects/functions in dependency arrays
- Create new objects/functions inside useEffect
- Ignore ESLint warnings about missing dependencies
- Use `setState` directly inside useEffect without conditions

## Testing
After applying the fixes:
- Dashboard loads without infinite loops
- Quiz data loads properly on mount
- No console errors or warnings
- Performance improved (no unnecessary re-renders)

## Files Modified
- `src/app/dashboard/page.tsx` - Fixed useEffect dependency
- `src/hooks/useQuizStore.tsx` - Added useCallback to loadQuizzes
- `src/hooks/useStableQuizActions.ts` - New stable actions hook

This pattern can be applied to other components that use the quiz store to prevent similar issues.