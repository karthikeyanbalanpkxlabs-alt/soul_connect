import React from "react";

export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  isFilterable?: boolean;
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
}: DynamicTableProps<T>) {
  const currentPage = Math.floor(skip / limit) + 1;

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* TABLE */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm">
          <thead>
            {/* HEADER */}
            <tr className="bg-gray-100">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  style={{
                    width: column.width,
                  }}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap"
                >
                  {column.label}
                </th>
              ))}
            </tr>

            {/* FILTERS */}
            <tr className="border-b">
              {columns.map((column) => (
                <th key={String(column.key)} className="p-2">
                  {column.isFilterable ? (
                    <input
                      type="text"
                      value={filters[String(column.key)] || ""}
                      placeholder={`Search ${column.label}`}
                      className="w-full min-w-[120px] bg-white rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-violet-500"
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
                  Loading...
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
                <tr key={rowIndex} className="border-b hover:bg-gray-50">
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
          <span className="ml-1 font-semibold">{total}</span>
        </div>

        {/* Limit */}
        <div className="flex items-center justify-between md:justify-start gap-2">
          <span className="text-sm">Rows Per Page:</span>

          <select
            value={limit}
            className="bg-white rounded border px-2 py-1"
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
          </select>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between md:justify-start gap-2">
          <button
            disabled={currentPage === 1}
            className="bg-white rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => onPageChange(Math.max(0, skip - limit), limit)}
          >
            Previous
          </button>

          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage >= totalPages}
            className="bg-white rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
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
