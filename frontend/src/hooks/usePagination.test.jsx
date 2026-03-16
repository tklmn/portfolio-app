import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { usePagination } from './usePagination';

const items = Array.from({ length: 25 }, (_, i) => i + 1); // [1..25]

// Wrapper for hooks that use useSearchParams
const wrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;

// ─── state mode ────────────────────────────────────────────────────────────────

describe('usePagination — state mode', () => {
  it('returns page 1 by default', () => {
    const { result } = renderHook(() => usePagination(items, 10));
    expect(result.current.currentPage).toBe(1);
  });

  it('slices items correctly for page 1', () => {
    const { result } = renderHook(() => usePagination(items, 10));
    expect(result.current.paginatedItems).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('slices items correctly for page 2', () => {
    const { result } = renderHook(() => usePagination(items, 10));
    act(() => result.current.setCurrentPage(2));
    expect(result.current.paginatedItems).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });

  it('calculates totalPages correctly', () => {
    const { result } = renderHook(() => usePagination(items, 10));
    expect(result.current.totalPages).toBe(3); // ceil(25/10)
  });

  it('returns 1 totalPage for empty array', () => {
    const { result } = renderHook(() => usePagination([], 10));
    expect(result.current.totalPages).toBe(1);
    expect(result.current.paginatedItems).toEqual([]);
  });

  it('clamps currentPage to totalPages when out of range', () => {
    const { result } = renderHook(() => usePagination(items, 10));
    act(() => result.current.setCurrentPage(999));
    expect(result.current.currentPage).toBe(3);
  });

  it('exposes perPage', () => {
    const { result } = renderHook(() => usePagination(items, 10));
    expect(result.current.perPage).toBe(10);
  });

  it('handles items fewer than perPage', () => {
    const { result } = renderHook(() => usePagination([1, 2, 3], 10));
    expect(result.current.totalPages).toBe(1);
    expect(result.current.paginatedItems).toEqual([1, 2, 3]);
  });

  it('handles perPage equal to items length', () => {
    const tenItems = Array.from({ length: 10 }, (_, i) => i);
    const { result } = renderHook(() => usePagination(tenItems, 10));
    expect(result.current.totalPages).toBe(1);
    expect(result.current.paginatedItems).toHaveLength(10);
  });
});

// ─── url mode ──────────────────────────────────────────────────────────────────

describe('usePagination — url mode', () => {
  it('starts on page 1 when no query param', () => {
    const { result } = renderHook(() => usePagination(items, 10, { mode: 'url' }), { wrapper });
    expect(result.current.currentPage).toBe(1);
  });

  it('navigates to page 2 and back', () => {
    const { result } = renderHook(() => usePagination(items, 10, { mode: 'url' }), { wrapper });
    act(() => result.current.setCurrentPage(2));
    expect(result.current.currentPage).toBe(2);
    act(() => result.current.setCurrentPage(1));
    expect(result.current.currentPage).toBe(1);
  });

  it('returns correct slice for page 3', () => {
    const { result } = renderHook(() => usePagination(items, 10, { mode: 'url' }), { wrapper });
    act(() => result.current.setCurrentPage(3));
    expect(result.current.paginatedItems).toEqual([21, 22, 23, 24, 25]);
  });
});

// ─── session mode ──────────────────────────────────────────────────────────────

describe('usePagination — session mode', () => {
  const key = 'test_page_key';

  beforeEach(() => sessionStorage.removeItem(key));
  afterEach(() => sessionStorage.removeItem(key));

  it('starts on page 1 when sessionStorage is empty', () => {
    const { result } = renderHook(() => usePagination(items, 10, { mode: 'session', storageKey: key }));
    expect(result.current.currentPage).toBe(1);
  });

  it('persists page to sessionStorage on navigation', () => {
    const { result } = renderHook(() => usePagination(items, 10, { mode: 'session', storageKey: key }));
    act(() => result.current.setCurrentPage(2));
    expect(sessionStorage.getItem(key)).toBe('2');
  });

  it('restores page from sessionStorage on mount', () => {
    sessionStorage.setItem(key, '3');
    const { result } = renderHook(() => usePagination(items, 10, { mode: 'session', storageKey: key }));
    expect(result.current.currentPage).toBe(3);
  });
});
