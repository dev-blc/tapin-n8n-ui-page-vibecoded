import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

/**
 * A reusable pagination component with dynamic page numbers and item count display.
 * 
 * @param {Object} props
 * @param {number} props.currentPage - Current active page (1-based)
 * @param {number} props.totalItems - Total number of items after filtering
 * @param {number} props.itemsPerPage - Number of items displayed per page
 * @param {Function} props.onPageChange - Handler for page changes
 * @param {string} [props.className] - Optional extra utility classes
 */
export const Pagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = ""
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  
  // Ensure current page is within bounds
  const activePage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (activePage - 1) * itemsPerPage + 1;
  const endItem = Math.min(activePage * itemsPerPage, totalItems);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first, last, and pages around current
      pages.push(1);
      
      let start = Math.max(2, activePage - 1);
      let end = Math.min(totalPages - 1, activePage + 1);

      if (activePage <= 2) end = 4;
      if (activePage >= totalPages - 1) start = totalPages - 3;

      if (start > 2) pages.push('ellipsis-start');
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (end < totalPages - 1) pages.push('ellipsis-end');
      
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 py-4 w-full", className)}>
      <div className="flex-1 text-sm text-muted-foreground order-2 sm:order-1 text-center sm:text-left">
        Showing <span className="font-medium text-foreground">{startItem}</span> to <span className="font-medium text-foreground">{endItem}</span> of <span className="font-medium text-foreground">{totalItems}</span> items
      </div>

      <nav className="flex items-center justify-center space-x-1 order-1 sm:order-2 flex-grow-0 sm:flex-grow">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => onPageChange(activePage - 1)}
          disabled={activePage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous Page</span>
        </Button>

        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) => {
            if (page === 'ellipsis-start' || page === 'ellipsis-end') {
              return (
                <div key={`ellipsis-${index}`} className="flex h-9 w-9 items-center justify-center">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </div>
              );
            }

            return (
              <Button
                key={page}
                variant={activePage === page ? "primary" : "outline"}
                size="sm"
                className={cn(
                  "h-9 w-9 font-medium",
                  activePage === page ? "" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => onPageChange(activePage + 1)}
          disabled={activePage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next Page</span>
        </Button>
      </nav>

      <div className="hidden sm:block flex-1 order-3" />
    </div>
  );
};

export default Pagination;
