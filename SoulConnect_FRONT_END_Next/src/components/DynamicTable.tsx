"use client";

import React, { useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ArrowUpDown, ArrowUp, ArrowDown, XCircle } from "lucide-react";

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

  const hasActiveFilters = Object.values(filters).some(
    (v) => v && String(v).trim() !== ""
  );

  const clearAllFilters = () => {
    Object.keys(filters).forEach((k) => onFilterChange(k, ""));
    onPageChange(0, limit);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* FILTER STATUS / CLEAR HEADER */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between px-4 py-2 bg-violet-50/60 border-b border-violet-100 text-xs">
          <span className="text-violet-700 font-medium">
            Active filters applied
          </span>
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-violet-600 hover:text-violet-900 font-semibold cursor-pointer"
          >
            <XCircle size={14} /> Clear All Filters
          </button>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm">
          <thead>
            {/* HEADER */}
            <tr className="bg-gray-100 border-b border-gray-200">
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
                    className={`px-4 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap select-none ${
                      isSortable ? "cursor-pointer hover:bg-gray-200/80 transition" : ""
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{column.label}</span>
                      {isSortable && (
                        <span className="text-gray-400">
                          {isSorted ? (
                            sortOrder === "asc" ? (
                              <ArrowUp size={14} className="text-violet-600" />
                            ) : (
                              <ArrowDown size={14} className="text-violet-600" />
                            )
                          ) : (
                            <ArrowUpDown size={13} className="opacity-50 hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>

            {/* FILTERS */}
            <tr className="border-b bg-gray-50/50">
              {columns.map((column) => (
                <th key={String(column.key)} className="p-2">
                  {column.isFilterable ? (
                    <input
                      type="text"
                      value={filters[String(column.key)] || ""}
                      placeholder={`Search ${column.label}`}
                      className="w-full min-w-[120px] bg-white rounded-md border border-gray-300 px-3 py-1.5 text-xs outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                      onChange={(e) =>
                        onFilterChange(String(column.key), e.target.value)
                      }
                    />
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-8 text-center text-gray-500"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-600 border-t-transparent"></div>
                    <span>Loading...</span>
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-8 text-center text-gray-500"
                >
                  No Records Found
                </td>
              </tr>
            ) : (
              rows.map((row: any, rowIndex) => (
                <tr key={rowIndex} className="border-b hover:bg-gray-50/80 transition">
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className="px-4 py-3 text-sm text-gray-700 text-left whitespace-nowrap"
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

      {/* FOOTER */}
      <div className="flex flex-col gap-4 border-t p-4 md:flex-row md:items-center md:justify-between">
        {/* Total */}
        <div className="text-sm text-gray-600 flex justify-between items-center md:justify-start">
          Total Records:
          <span className="ml-1 font-semibold text-gray-900">{total}</span>
        </div>

        {/* Limit */}
        <div className="flex items-center justify-between md:justify-start gap-2 text-sm">
          <span>Rows Per Page:</span>

          <select
            value={limit}
            className="bg-white rounded border border-gray-300 px-2.5 py-1 text-sm outline-none focus:border-violet-500 cursor-pointer"
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

        {/* Pagination */}
        <div className="flex items-center justify-between md:justify-start gap-2">
          <button
            disabled={currentPage === 1}
            className="bg-white rounded border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition cursor-pointer"
            onClick={() => onPageChange(Math.max(0, skip - limit), limit)}
          >
            Previous
          </button>

          <span className="text-sm text-gray-600 font-medium">
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage >= totalPages}
            className="bg-white rounded border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition cursor-pointer"
            onClick={() => onPageChange(skip + limit, limit)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default DynamicTable;
export { DynamicTable };
