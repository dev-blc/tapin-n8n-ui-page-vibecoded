import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Standardized badge component to handle status coloring consistently
 * across the application.
 * 
 * @param {Object} props
 * @param {string} props.status - The current status (Active, Inactive, Draft, Locked, etc.)
 * @param {string} [props.className] - Optional extra utility classes
 */
export const StatusBadge = ({ status, className = "" }) => {
  const getVariant = (statusName) => {
    const s = (statusName || '').toLowerCase();
    
    switch (s) {
      case 'active':
      case 'completed':
      case 'success':
        return 'success';
      case 'inactive':
      case 'failed':
      case 'disconnected':
      case 'destructive':
        return 'destructive';
      case 'locked':
      case 'warning':
      case 'processing':
      case 'pending':
        return 'warning';
      case 'draft':
      case 'review':
      case 'secondary':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Badge 
      variant={getVariant(status)} 
      className={cn(
        "shadow-[0_0_10px_rgba(0,0,0,0.05)] border-opacity-40 transition-all duration-300 hover:shadow-md",
        className
      )}
    >
      {status || 'Unknown'}
    </Badge>
  );
};

export default StatusBadge;
