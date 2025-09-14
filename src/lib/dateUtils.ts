/**
 * Date formatting utilities that are hydration-safe
 * Prevents SSR/client mismatch in date formatting
 */

/**
 * Format date consistently between server and client
 * Uses ISO date format to avoid locale/timezone differences
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    
    // Use toISOString().split('T')[0] for consistent YYYY-MM-DD format
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.warn('Invalid date string:', dateString);
    return 'Invalid Date';
  }
}

/**
 * Format date for display (safe for hydration)
 * Only renders on client to avoid SSR mismatch
 */
export function formatDateForDisplay(dateString: string): string {
  if (typeof window === 'undefined') {
    // Server-side: return consistent format
    return formatDate(dateString);
  }
  
  // Client-side: can use locale formatting
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return formatDate(dateString);
  }
}

/**
 * Get relative time (e.g., "2 days ago")
 * Safe for hydration
 */
export function getRelativeTime(dateString: string): string {
  if (typeof window === 'undefined') {
    // Server-side: return simple format
    return formatDate(dateString);
  }

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return formatDateForDisplay(dateString);
  } catch (error) {
    return formatDate(dateString);
  }
}

/**
 * Current year for copyright (hydration-safe)
 */
export function getCurrentYear(): number {
  if (typeof window === 'undefined') {
    // Server-side: return current year statically
    return 2025; // Update this annually or use build-time injection
  }
  
  // Client-side: get actual current year
  return new Date().getFullYear();
}