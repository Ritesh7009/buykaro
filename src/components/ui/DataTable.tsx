import React, { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  sortValue?: (item: T) => number | string;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  emptyState?: React.ReactNode;
  className?: string;
  defaultSortKey?: string;
  defaultSortDirection?: 'asc' | 'desc';
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  emptyState,
  className = '',
  defaultSortKey,
  defaultSortDirection = 'asc',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | undefined>(defaultSortKey);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);

  const handleHeaderClick = (column: Column<T>) => {
    if (!column.sortable) return;
    if (sortKey === column.key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(column.key);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col || !col.sortValue) return data;

    return [...data].sort((a, b) => {
      const valA = col.sortValue!(a);
      const valB = col.sortValue!(b);

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortDirection === 'asc'
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });
  }, [data, sortKey, sortDirection, columns]);

  return (
    <div className={`w-full overflow-hidden border border-[#E7EAE6] rounded-xl bg-white ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#FAFBF9] border-b border-[#E7EAE6] text-[#737A75] font-semibold">
              {columns.map((col) => {
                const isCurrentSort = sortKey === col.key;
                const alignClass =
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                    ? 'text-center'
                    : 'text-left';

                return (
                  <th
                    key={col.key}
                    onClick={() => handleHeaderClick(col)}
                    className={`py-3.5 px-4 select-none whitespace-nowrap ${alignClass} ${
                      col.sortable ? 'cursor-pointer hover:text-[#202521] hover:bg-[#F2F4F1]/60' : ''
                    } ${col.className || ''}`}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'right' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-[#737A75]">
                          {isCurrentSort ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-[#315C48]" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-[#315C48]" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-60" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E7EAE6]">
            {sortedData.length > 0 ? (
              sortedData.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  className="hover:bg-[#FAFBF9] transition-colors"
                >
                  {columns.map((col) => {
                    const alignClass =
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left';

                    return (
                      <td
                        key={col.key}
                        className={`py-3.5 px-4 text-[#202521] ${alignClass} ${col.className || ''}`}
                      >
                        {col.render
                          ? col.render(item)
                          : (item as any)[col.key]}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-[#737A75]">
                  {emptyState || 'No records available.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
