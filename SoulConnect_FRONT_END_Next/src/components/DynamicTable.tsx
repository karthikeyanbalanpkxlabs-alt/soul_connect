"use client";

import React, { useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  XCircle,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  FilterX,
} from "lucide-react";

export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  isFilterable?: boolean;
  isSortable?: boolean;
  width?: string;
  render?: (row: T) => React.ReactNode;
}

interface DynamicTableProps<T = any> {
  columns: TableColumn<T>[];
  rows: T[];

  loading?: boolean;

  total: number;
  skip: number;
  limit: number;

  filters: Record<string, string>;

  onFilterChange: (key: string, value: string) => void;
  onPageChange: (skip: number, limit: number) => void;
  onLimitChange?: (limit: number) => void;

  sortField?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (field: string, order: "asc" | "desc") => void;

  syncWithUrl?: boolean;
}

function DynamicTable<T>({
  columns,
  rows,
  loading = false,
  total,
  skip,
  limit,
  filters,
  onFilterChange,
  onPageChange,
  onLimitChange,
  sortField,
  sortOrder,
  onSortChange,
  syncWithUrl = true,
}: DynamicTableProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInitialUrlSyncDone = useRef(false);

  // Read initial controls state from URL search params on page load/refresh
  useEffect(() => {
    if (!syncWithUrl || isInitialUrlSyncDone.current) return;
    isInitialUrlSyncDone.current = true;

    if (!searchParams) return;

    const urlSkip = searchParams.get("skip");
    const urlLimit = searchParams.get("limit");
    const urlSort = searchParams.get("sort");
    const urlOrder = searchParams.get("order") as "asc" | "desc" | null;

    if (urlSkip !== null && !isNaN(Number(urlSkip))) {
      const parsedSkip = Number(urlSkip);
      const parsedLimit = urlLimit ? Number(urlLimit) : limit;
      if (parsedSkip !== skip) {
        onPageChange(parsedSkip, parsedLimit);
      }
    }

    if (urlLimit !== null && !isNaN(Number(urlLimit)) && onLimitChange) {
      const parsedLimit = Number(urlLimit);
      if (parsedLimit !== limit) {
        onLimitChange(parsedLimit);
      }
    }

    if (urlSort && onSortChange) {
      const orderVal = urlOrder === "asc" ? "asc" : "desc";
      if (urlSort !== sortField || orderVal !== sortOrder) {
        onSortChange(urlSort, orderVal);
      }
    }

    // Sync filter keys from URL params
    columns.forEach((col) => {
      const keyStr = String(col.key);
      const val = searchParams.get(keyStr);
      if (val !== null && val !== (filters[keyStr] || "")) {
        onFilterChange(keyStr, val);
      }
    });
  }, [searchParams, syncWithUrl]);

  // Sync state changes back to URL search params
  useEffect(() => {
    if (!syncWithUrl || !isInitialUrlSyncDone.current) return;

    const params = new URLSearchParams();

    if (skip > 0) params.set("skip", String(skip));
    if (limit !== 10) params.set("limit", String(limit));
    if (sortField) {
      params.set("sort", sortField);
      if (sortOrder) params.set("order", sortOrder);
    }

    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key].trim() !== "") {
        params.set(key, filters[key].trim());
      }
    });

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    window.history.replaceState(null, "", newUrl);
  }, [skip, limit, filters, sortField, sortOrder, pathname, syncWithUrl]);

  const currentPage = Math.floor(skip / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleHeaderClick = (column: TableColumn<T>) => {
    const keyStr = String(column.key);
    if (!onSortChange || column.isSortable === false || keyStr === "action") return;

    if (sortField !== keyStr) {
      onSortChange(keyStr, "asc");
    } else if (sortOrder === "asc") {
      onSortChange(keyStr, "desc");
    } else {
      onSortChange("", "desc");
    }
  };

  const activeFilters = Object.entries(filters).filter(
    ([_, val]) => val && String(val).trim() !== ""
  );

  const clearAllFilters = () => {
    Object.keys(filters).forEach((k) => onFilterChange(k, ""));
    onPageChange(0, limit);
  };

  const getColumnLabel = (keyStr: string) => {
    const col = columns.find((c) => String(c.key) === keyStr);
    return col ? col.label : keyStr;
  };

  // Generate pagination pages
  const renderPageButtons = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    return pages.map((page, idx) => {
      if (typeof page === "string") {
        return (
          <span key={`ellipse-${idx}`} className="px-2 py-1 text-xs text-slate-400">
            ...
          </span>
        );
      }
      const isActive = page === currentPage;
      return (
        <button
          key={page}
          onClick={() => onPageChange((page - 1) * limit, limit)}
          className={`h-8 min-w-[32px] px-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
            isActive
              ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20 scale-105"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
          }`}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      {/* FILTER CHIPS BANNER */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-gradient-to-r from-violet-50/80 via-indigo-50/40 to-slate-50 border-b border-violet-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-violet-800 font-semibold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-violet-600 animate-pulse"></span>
              Active Filters:
            </span>
            {activeFilters.map(([key, val]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-violet-200 text-violet-700 font-medium shadow-2xs text-[11px]"
              >
                <span className="text-slate-400">{getColumnLabel(key)}:</span>
                <span className="font-semibold text-violet-900">{val}</span>
                <button
                  onClick={() => onFilterChange(key, "")}
                  className="text-violet-400 hover:text-violet-700 rounded-full p-0.5 transition-colors cursor-pointer"
                  title="Remove filter"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>

          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-violet-600 hover:text-violet-900 hover:bg-violet-100/60 font-semibold cursor-pointer transition-colors text-xs"
          >
            <XCircle size={14} /> Clear All
          </button>
        </div>
      )}

      {/* TABLE DATA */}
      <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-slate-200">
        <table className="w-full text-sm border-collapse">
          <thead>
            {/* HEADER COLUMNS */}
            <tr className="bg-slate-50/90 border-b border-slate-200/80">
              {columns.map((column) => {
                const keyStr = String(column.key);
                const isSortable =
                  column.isSortable !== false && keyStr !== "action";
                const isSorted = sortField === keyStr;

                return (
                  <th
                    key={keyStr}
                    style={{ width: column.width }}
                    onClick={() => isSortable && handleHeaderClick(column)}
                    className={`px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap select-none transition-colors ${
                      isSortable
                        ? "cursor-pointer hover:bg-slate-100/80 hover:text-slate-800"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{column.label}</span>
                      {isSortable && (
                        <span className="transition-transform duration-200">
                          {isSorted ? (
                            sortOrder === "asc" ? (
                              <span className="p-0.5 rounded bg-violet-100 text-violet-600 inline-block">
                                <ArrowUp size={13} />
                              </span>
                            ) : (
                              <span className="p-0.5 rounded bg-violet-100 text-violet-600 inline-block">
                                <ArrowDown size={13} />
                              </span>
                            )
                          ) : (
                            <ArrowUpDown size={12} className="text-slate-400 opacity-60 hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>

            {/* INLINE FILTERS */}
            <tr className="border-b border-slate-200/60 bg-slate-50/40">
              {columns.map((column) => {
                const keyStr = String(column.key);
                const val = filters[keyStr] || "";

                return (
                  <th key={keyStr} className="px-3 py-2">
                    {column.isFilterable ? (
                      <div className="relative flex items-center">
                        <Search
                          size={13}
                          className="absolute left-2.5 text-slate-400 pointer-events-none"
                        />
                        <input
                          type="text"
                          value={val}
                          placeholder={`Filter ${column.label}...`}
                          className="w-full min-w-[120px] bg-white border border-slate-200 rounded-lg pl-7 pr-7 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all shadow-2xs"
                          onChange={(e) =>
                            onFilterChange(keyStr, e.target.value)
                          }
                        />
                        {val && (
                          <button
                            onClick={() => onFilterChange(keyStr, "")}
                            className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    ) : null}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              // SKELETON LOADING
              Array.from({ length: limit > 5 ? 5 : limit }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="animate-pulse">
                  {columns.map((col, colIdx) => (
                    <td key={`sk-cell-${colIdx}`} className="px-4 py-4">
                      <div
                        className="h-4 bg-slate-200/80 rounded-md"
                        style={{
                          width: colIdx === 0 ? "60%" : colIdx === 3 ? "80%" : "40%",
                        }}
                      ></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              // EMPTY STATE
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-16 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center justify-center gap-3 max-w-sm mx-auto">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <FilterX size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        No records found
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        We couldn't find any results matching your active criteria.
                      </p>
                    </div>
                    {activeFilters.length > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="mt-2 text-xs font-semibold text-violet-600 hover:text-violet-800 bg-violet-50 hover:bg-violet-100 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              // TABLE ROWS
              rows.map((row: any, rowIndex) => (
                <tr
                  key={row._id || row.id || rowIndex}
                  className="hover:bg-violet-50/30 transition-colors duration-150 group"
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className="px-4 py-3.5 text-sm text-slate-700 text-left whitespace-nowrap align-middle"
                    >
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER & PAGINATION */}
      <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between bg-slate-50/50">
        {/* TOTAL RECORDS INFO */}
        <div className="text-xs text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-800">
            {total > 0 ? skip + 1 : 0}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-slate-800">
            {Math.min(skip + limit, total)}
          </span>{" "}
          of <span className="font-semibold text-slate-800">{total}</span>{" "}
          entries
        </div>

        {/* ROWS PER PAGE SELECTOR */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Per page:</span>
          <select
            value={limit}
            className="bg-white rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 font-medium outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 cursor-pointer shadow-2xs transition-all"
            onChange={(e) => {
              const newLimit = Number(e.target.value);
              if (onLimitChange) {
                onLimitChange(newLimit);
              }
              onPageChange(0, newLimit);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {/* PAGE NAVIGATION BUTTONS */}
        <div className="flex items-center gap-1.5">
          <button
            disabled={currentPage === 1 || loading}
            className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1 text-xs font-medium"
            onClick={() => onPageChange(Math.max(0, skip - limit), limit)}
            title="Previous Page"
          >
            <ChevronLeft size={15} />
            <span className="hidden md:inline">Prev</span>
          </button>

          <div className="flex items-center gap-1">
            {renderPageButtons()}
          </div>

          <button
            disabled={currentPage >= totalPages || loading}
            className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1 text-xs font-medium"
            onClick={() => onPageChange(skip + limit, limit)}
            title="Next Page"
          >
            <span className="hidden md:inline">Next</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DynamicTable;
export { DynamicTable };

