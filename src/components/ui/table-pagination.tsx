'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const PAGE_SIZE_OPTIONS = ['10', '25', '50'];

interface TablePaginationProps {
  /** 0-based. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  pageSize: string;
  onPageSizeChange: (pageSize: string) => void;
  pageSizeLabel: string;
  /** e.g. "Showing 1 - 10 of 42". */
  summary?: string;
}

/** Client-side pager for small, fully-loaded lists. Chevrons flip in RTL. */
export function TablePagination({
  page,
  pageCount,
  onPageChange,
  pageSize,
  onPageSizeChange,
  pageSizeLabel,
  summary,
}: TablePaginationProps) {
  const goTo = (next: number) => onPageChange(Math.min(Math.max(next, 0), pageCount - 1));
  const buttonClass =
    'rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 disabled:opacity-40 [&_svg]:rtl:rotate-180';

  return (
    <div className="flex items-center justify-between px-1">
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <span>{pageSizeLabel}</span>
        <Select value={pageSize} onValueChange={onPageSizeChange}>
          <SelectTrigger className="w-20">
            <SelectValue>{pageSize}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1">
        {summary && <span className="me-3 text-sm text-zinc-500">{summary}</span>}
        <button type="button" onClick={() => goTo(0)} disabled={page === 0} className={buttonClass}>
          <ChevronsLeft className="size-4" />
        </button>
        <button type="button" onClick={() => goTo(page - 1)} disabled={page === 0} className={buttonClass}>
          <ChevronLeft className="size-4" />
        </button>
        <span className="flex size-7 items-center justify-center rounded-full bg-brand-muted text-sm font-medium text-brand">
          {page + 1}
        </span>
        <button
          type="button"
          onClick={() => goTo(page + 1)}
          disabled={page >= pageCount - 1}
          className={buttonClass}
        >
          <ChevronRight className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => goTo(pageCount - 1)}
          disabled={page >= pageCount - 1}
          className={buttonClass}
        >
          <ChevronsRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
