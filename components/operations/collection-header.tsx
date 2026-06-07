"use client";

import { Plus, DownloadSimple, FileArrowUp, MagnifyingGlass } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CollectionHeaderProps {
  title: string;
  count: number | string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddRecord: () => void;
  onImportCSV: () => void;
  onImportExcel: () => void;
}

export function CollectionHeader({
  title,
  count,
  searchTerm,
  onSearchChange,
  onAddRecord,
  onImportCSV,
  onImportExcel,
}: CollectionHeaderProps) {
  return (
    <div className="mb-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold capitalize tracking-tight text-slate-900">
              {title}
            </h1>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {count} records
            </span>
          </div>
          <p className="mt-1 text-slate-500">
            Manage and organize your {title} data.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onImportCSV}
            className="hidden sm:flex"
          >
            <FileArrowUp size={18} className="mr-2" />
            Import CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onImportExcel}
            className="hidden sm:flex"
          >
            <DownloadSimple size={18} className="mr-2" />
            Import Excel
          </Button>
          <Button size="sm" onClick={onAddRecord} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus size={18} className="sm:mr-2" />
            <span className="hidden sm:inline">Add Record</span>
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <MagnifyingGlass
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <Input
          placeholder={`Search ${title}...`}
          className="pl-10 h-11 rounded-xl border-slate-200 bg-white"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
