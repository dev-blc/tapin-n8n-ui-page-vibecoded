import { Badge } from '@/components/ui/badge';

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
    <Badge variant={getVariant(status)} className={className}>
      {status || 'Unknown'}
    </Badge>
  );
};

export default StatusBadge;
