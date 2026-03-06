import { Button } from '@/components/ui/button';
import React from 'react';

/**
 * A reusable card-like button for the Dashboard quick actions.
 * 
 * @param {Object} props
 * @param {string} props.title - Text label for the action
 * @param {React.ElementType} props.icon - Lucide icon component
 * @param {string} props.color - CSS background color class for the icon container
 * @param {Function} props.onClick - Handler for click events
 * @param {string} [props.className] - Optional extra utility classes
 */
export const QuickActionCard = ({ title, icon: Icon, color, onClick, className = "" }) => {
  return (
    <Button
      variant="outline"
      className={`h-auto p-6 flex flex-col items-center space-y-3 group hover:shadow-lg transition-all duration-200 w-full ${className}`}
      onClick={onClick}
    >
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <span className="text-sm font-medium text-center">
        {title}
      </span>
    </Button>
  );
};

export default QuickActionCard;
