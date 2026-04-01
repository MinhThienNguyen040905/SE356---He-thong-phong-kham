
import { Button } from "./button";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

interface PremiumPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function PremiumPagination({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange 
}: PremiumPaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl border border-gray-100">
      {}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span className="font-medium text-gray-900">{startItem}-{endItem}</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">{totalItems} mục</span>
        </div>
      </div>

      {}
      <div className="flex items-center gap-1">
        {}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-9 w-9 p-0 rounded-xl hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {}
        <div className="flex items-center gap-1 px-1">
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span 
                key={`ellipsis-${index}`} 
                className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm"
              >
                •••
              </span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "ghost"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className={`
                  h-9 w-9 p-0 rounded-xl font-medium text-sm transition-all duration-200
                  ${currentPage === page 
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 scale-105' 
                    : 'hover:bg-blue-50 hover:text-blue-600 text-gray-600'
                  }
                `}
              >
                {page}
              </Button>
            )
          ))}
        </div>

        {}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-9 w-9 p-0 rounded-xl hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {}
      <div className="hidden sm:flex items-center gap-2">
        <span className="text-sm text-gray-500">Trang</span>
        <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <span className="px-3 py-1.5 font-semibold text-blue-600 bg-blue-50/50">{currentPage}</span>
          <span className="px-2 py-1.5 text-gray-400 text-sm">/</span>
          <span className="px-3 py-1.5 text-gray-600">{totalPages}</span>
        </div>
      </div>
    </div>
  );
}
