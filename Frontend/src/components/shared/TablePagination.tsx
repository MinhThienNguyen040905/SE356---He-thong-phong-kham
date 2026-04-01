
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "../ui/pagination"
import { cn } from "../../lib/utils"

interface TablePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showingCount: number
  totalCount: number
  resourceName?: string
  className?: string
}

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  showingCount,
  totalCount,
  resourceName = "kết quả",
  className
}: TablePaginationProps) {
  if (totalCount === 0) return null

  return (
    <div className={cn("px-4 md:px-6 py-3 md:py-4 border-t bg-white flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-6", className)}>
      <div className="text-xs md:text-xs font-bold text-slate-400 uppercase tracking-widest text-center sm:text-left">
        Hiển thị <span className="text-slate-900">{showingCount}</span> trên <span className="text-slate-900">{totalCount}</span> {resourceName}
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#" 
              onClick={(e) => { 
                e.preventDefault()
                if(currentPage > 1) onPageChange(currentPage - 1) 
              }}
              className={cn("rounded-xl border-0 bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold", currentPage === 1 && "pointer-events-none opacity-50")}
            />
          </PaginationItem>
          <div className="flex items-center px-4 font-bold text-sm text-slate-700">
              Trang {currentPage} / {totalPages || 1}
          </div>
          <PaginationItem>
            <PaginationNext 
              href="#" 
              onClick={(e) => { 
                e.preventDefault()
                if(currentPage < totalPages) onPageChange(currentPage + 1) 
              }}
              className={cn("rounded-xl border-0 bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold", currentPage === totalPages && "pointer-events-none opacity-50")}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
