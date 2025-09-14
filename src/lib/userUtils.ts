/**
 * User utility functions
 * Provides consistent user identification across the application
 */

/**
 * Get current user ID - for now using a default user
 * In production this would come from authentication
 */
export function getCurrentUserId(): string {
  // TODO: Replace with actual authentication
  return 'default-user';
}

/**
 * Get user identifier for API calls
 */
export function getUserForAPI(): { userId: string } {
  return { userId: getCurrentUserId() };
}