import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Reusable pagination hook.
 * mode: 'url' — persists page in ?page= query param (for routed pages)
 *        'session' — persists in sessionStorage (for non-routed sections)
 *        'state' — no persistence (default)
 */
export function usePagination(items, perPage = 10, options = {}) {
  const { mode = 'state', storageKey = 'page' } = options;

  // URL-based persistence
  const [searchParams, setSearchParams] = mode === 'url' ? useSearchParams() : [null, null];

  // Session-based persistence
  const [statePage, setStatePage] = useState(() => {
    if (mode === 'session') return parseInt(sessionStorage.getItem(storageKey)) || 1;
    return 1;
  });

  let currentPage, setCurrentPage;

  if (mode === 'url' && searchParams) {
    currentPage = parseInt(searchParams.get('page')) || 1;
    setCurrentPage = (page) => {
      setSearchParams(page > 1 ? { page: String(page) } : {}, { replace: true });
    };
  } else if (mode === 'session') {
    currentPage = statePage;
    setCurrentPage = (page) => {
      setStatePage(page);
      sessionStorage.setItem(storageKey, String(page));
    };
  } else {
    currentPage = statePage;
    setCurrentPage = setStatePage;
  }

  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedItems = items.slice((safePage - 1) * perPage, safePage * perPage);

  return {
    currentPage: safePage,
    setCurrentPage,
    totalPages,
    paginatedItems,
    perPage,
  };
}
