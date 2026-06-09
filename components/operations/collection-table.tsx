"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CaretUpDown, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export interface Column<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (item: T) => React.ReactNode;
}

interface CollectionTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKey: keyof T;
  searchTerm: string;
  // Server-side pagination props
  isServerSide?: boolean;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
}

export function CollectionTable<T extends { _id?: string; id?: string }>({
  data,
  columns,
  searchKey,
  searchTerm,
  isServerSide = false,
  currentPage: serverPage = 1,
  totalPages: serverTotalPages = 1,
  totalItems: serverTotalItems = 0,
  onPageChange,
}: CollectionTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: "asc" | "desc";
  } | null>(null);
  const [localPage, setLocalPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (key: keyof T) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredData = useMemo(() => {
    if (isServerSide) return data;
    return data.filter((item) => {
      const value = item[searchKey];
      if (typeof value === "string") {
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return false;
    });
  }, [data, searchKey, searchTerm, isServerSide]);

  const sortedData = useMemo(() => {
    if (isServerSide) return filteredData;
    const sortableItems = [...filteredData];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig, isServerSide]);

  const paginatedData = useMemo(() => {
    if (isServerSide) return sortedData;
    const startIndex = (localPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, localPage, isServerSide]);

  const currentPage = isServerSide ? serverPage : localPage;
  const totalPages = isServerSide ? serverTotalPages : Math.ceil(sortedData.length / itemsPerPage);
  const totalItemsCount = isServerSide ? serverTotalItems : sortedData.length;

  const handlePageChange = (page: number) => {
    if (isServerSide && onPageChange) {
      onPageChange(page);
    } else {
      setLocalPage(page);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
              {columns.map((column) => (
                <TableHead key={column.header} className="h-12 py-3 px-6">
                  <button
                    className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
                    onClick={() => handleSort(column.accessorKey)}
                  >
                    {column.header}
                    <CaretUpDown size={14} weight="bold" />
                  </button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <TableRow
                  key={item._id || item.id}
                  className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0"
                >
                  {columns.map((column) => (
                    <TableCell key={column.header} className="py-4 px-6 text-sm text-slate-600">
                      {column.cell
                        ? column.cell(item)
                        : (item[column.accessorKey] as React.ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-slate-500"
                >
                  No records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-slate-500">
          Showing <span className="font-medium">{paginatedData.length}</span> of{" "}
          <span className="font-medium">{totalItemsCount}</span> results
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg border-slate-200"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          >
            <CaretLeft size={16} weight="bold" />
          </Button>
          <div className="flex items-center gap-1">
            {/* Show a limited number of page buttons if there are many pages */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "ghost"}
                  size="icon"
                  className={`h-8 w-8 rounded-lg text-xs font-bold ${
                    currentPage === pageNum
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg border-slate-200"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          >
            <CaretRight size={16} weight="bold" />
          </Button>
        </div>
      </div>
    </div>
  );
}
