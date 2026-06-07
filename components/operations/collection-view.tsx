"use client";

import { useState } from "react";
import { CollectionHeader } from "./collection-header";
import { CollectionTable, Column } from "./collection-table";

interface CollectionViewProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
  searchKey: keyof T;
}

export function CollectionView<T extends { id: string }>({
  title,
  data,
  columns,
  searchKey,
}: CollectionViewProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddRecord = () => {
    console.log(`Add record to ${title}`);
  };

  const handleImportCSV = () => {
    console.log(`Import CSV to ${title}`);
  };

  const handleImportExcel = () => {
    console.log(`Import Excel to ${title}`);
  };

  return (
    <div>
      <CollectionHeader
        title={title}
        count={data.length}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddRecord={handleAddRecord}
        onImportCSV={handleImportCSV}
        onImportExcel={handleImportExcel}
      />
      <CollectionTable
        data={data}
        columns={columns}
        searchKey={searchKey}
        searchTerm={searchTerm}
      />
    </div>
  );
}
