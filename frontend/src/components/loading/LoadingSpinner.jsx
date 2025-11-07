/**
 * Loading Spinner Component
 * Reusable loading spinner with optional message
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Loading Spinner Component
 * @param {Object} props
 * @param {string} [props.message] - Optional loading message
 * @param {string} [props.size] - Size: 'sm', 'md', 'lg'
 * @param {string} [props.className] - Additional CSS classes
 */
export const LoadingSpinner = ({ message, size = 'md', className }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
};

/**
 * Full Page Loading Spinner
 * @param {Object} props
 * @param {string} [props.message] - Optional loading message
 */
export const FullPageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner message={message} size="lg" />
    </div>
  );
};

/**
 * Inline Loading Spinner
 * @param {Object} props
 * @param {string} [props.className] - Additional CSS classes
 */
export const InlineLoader = ({ className }) => {
  return <LoadingSpinner size="sm" className={className} />;
};

/**
 * Table Loading Skeleton
 * @param {Object} props
 * @param {number} [props.rows] - Number of skeleton rows
 * @param {number} [props.columns] - Number of skeleton columns
 */
export const TableSkeleton = ({ rows = 5, columns = 5 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-10 bg-muted rounded animate-pulse flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Card Loading Skeleton
 * @param {Object} props
 * @param {number} [props.lines] - Number of skeleton lines
 */
export const CardSkeleton = ({ lines = 3 }) => {
  return (
    <div className="space-y-3 p-6">
      <div className="h-6 bg-muted rounded animate-pulse w-3/4" />
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-4 bg-muted rounded animate-pulse"
          style={{ width: `${100 - index * 10}%` }}
        />
      ))}
    </div>
  );
};

export default LoadingSpinner;

