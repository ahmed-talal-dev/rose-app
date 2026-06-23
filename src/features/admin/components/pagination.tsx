import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisible?: number;
}

const MAX_VISIBLE_DEFAULT = 3;

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisible = MAX_VISIBLE_DEFAULT,
}: PaginationProps) {
  const pages = Array.from(
    { length: Math.min(totalPages, maxVisible) },
    (_, i) => i + 1
  );

  const btnBase =
    "w-8 h-8 rounded border flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold";
  const btnDefault =
    "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800";
  const btnActive =
    "bg-primary-600 border-primary-600 text-white";

  return (
    <div className="flex justify-center mt-4">
      <div className="flex items-center gap-1.5 font-sans">
        <button type="button" onClick={() => onPageChange(1)} disabled={currentPage === 1} className={`${btnBase} ${btnDefault}`}>
          <ChevronsLeft size={14} />
        </button>
        <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={`${btnBase} ${btnDefault}`}>
          <ChevronLeft size={14} />
        </button>

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`${btnBase} ${currentPage === page ? btnActive : btnDefault}`}
          >
            {page}
          </button>
        ))}

        {totalPages > maxVisible && (
          <>
            <span className="w-8 h-8 flex items-center justify-center text-zinc-400 text-sm select-none">...</span>
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              className={`${btnBase} ${currentPage === totalPages ? btnActive : btnDefault}`}
            >
              {totalPages}
            </button>
          </>
        )}

        <button type="button" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`${btnBase} ${btnDefault}`}>
          <ChevronRight size={14} />
        </button>
        <button type="button" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className={`${btnBase} ${btnDefault}`}>
          <ChevronsRight size={14} />
        </button>
      </div>
    </div>
  );
}
