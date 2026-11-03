/**
 * Formatting utilities for CampusCart (Indian Rupee & Product Age in Years)
 */

export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}

export function formatAge(years: number): string {
  if (years === 0) return 'Brand new (< 1 yr)';
  if (years === 1) return '1 yr old';
  // If integer
  if (Number.isInteger(years)) {
    return `${years} yrs old`;
  }
  // If decimal (e.g., 1.5, 0.8)
  return `${years.toFixed(1)} yrs old`;
}
