import { type ClassValue, clsx } from 'clsx';

/**
 * Utility function to merge Tailwind CSS classes
 * Simplified version that doesn't require tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
