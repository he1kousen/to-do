'use client';

import { useState, useMemo } from 'react';

interface UsePaginationOptions {
  items: unknown[];
  pageSize?: number;
}

export function usePagination<T>({ items, pageSize = 10 }: UsePaginationOptions & { items: T[] }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // Reset to page 1 if current page exceeds total
  const safePage = Math.min(currentPage, totalPages);
  if (safePage !== currentPage) {
    setCurrentPage(safePage);
  }

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return {
    currentPage: safePage,
    totalPages,
    paginatedItems,
    goToPage,
    totalItems: items.length,
  };
}
