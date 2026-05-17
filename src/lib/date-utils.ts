/**
 * Pure utility functions for date calculations
 * No server-side dependencies - safe to use in Client Components
 */

/**
 * Get the current active assignment number based on today's date
 * Assuming assignments are released one per week, starting from a baseline date
 */
export function getCurrentActiveAssignment(): number {
  const baselineDate = new Date('2024-01-01'); // When assignment 1 was released
  const today = new Date();
  const weeksElapsed = Math.floor(
    (today.getTime() - baselineDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
  );
  const currentAssignment = Math.min(weeksElapsed + 1, 10);
  return Math.max(1, currentAssignment);
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string, format: string = 'MMM dd, yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return dateObj.toLocaleDateString('en-US', options);
}

/**
 * Get days difference between two dates
 */
export function getDaysDifference(date1: Date, date2: Date = new Date()): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}
