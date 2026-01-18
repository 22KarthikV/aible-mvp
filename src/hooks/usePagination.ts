/**
 * usePagination Hook
 *
 * Hook for managing paginated data with client-side pagination.
 * Useful for long lists that need to be split across multiple pages.
 *
 * @example
 * const {
 *   currentPage,
 *   itemsPerPage,
 *   paginatedItems,
 *   totalPages,
 *   nextPage,
 *   prevPage,
 *   goToPage
 * } = usePagination(items, 20);
 */

import { useState, useMemo, useCallback } from 'react';

interface UsePaginationReturn<T> {
  currentPage: number;
  itemsPerPage: number;
  paginatedItems: T[];
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  startIndex: number;
  endIndex: number;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
}

export function usePagination<T>(
  items: T[],
  initialItemsPerPage: number = 20
): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  /**
   * Calculate total pages
   */
  const totalPages = useMemo(() => {
    return Math.ceil(items.length / itemsPerPage);
  }, [items.length, itemsPerPage]);

  /**
   * Calculate start and end indices
   */
  const { startIndex, endIndex } = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return { startIndex: start, endIndex: end };
  }, [currentPage, itemsPerPage]);

  /**
   * Get paginated items for current page
   */
  const paginatedItems = useMemo(() => {
    return items.slice(startIndex, endIndex);
  }, [items, startIndex, endIndex]);

  /**
   * Check if there are more pages
   */
  const hasNextPage = useMemo(() => {
    return currentPage < totalPages;
  }, [currentPage, totalPages]);

  /**
   * Check if there are previous pages
   */
  const hasPrevPage = useMemo(() => {
    return currentPage > 1;
  }, [currentPage]);

  /**
   * Go to next page
   */
  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  /**
   * Go to previous page
   */
  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  /**
   * Go to specific page
   */
  const goToPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(validPage);
    },
    [totalPages]
  );

  /**
   * Update items per page and reset to first page
   */
  const handleSetItemsPerPage = useCallback((count: number) => {
    setItemsPerPage(count);
    setCurrentPage(1); // Reset to first page when changing items per page
  }, []);

  return {
    currentPage,
    itemsPerPage,
    paginatedItems,
    totalPages,
    totalItems: items.length,
    hasNextPage,
    hasPrevPage,
    startIndex,
    endIndex,
    nextPage,
    prevPage,
    goToPage,
    setItemsPerPage: handleSetItemsPerPage,
  };
}
