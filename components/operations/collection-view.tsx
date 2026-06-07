"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { CollectionHeader } from "./collection-header";
import { CollectionTable, Column } from "./collection-table";
import { RecordDialog } from "./record-dialog";
import { ImportDialog } from "./import-dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "@phosphor-icons/react";
import { getColumns } from "./column-definitions";
import { getFields, getSearchKey } from "./field-definitions";

interface CollectionViewProps {
  title: string;
  collectionName: string;
}

export function CollectionView<T extends { _id: string; id?: string }>({
  title,
  collectionName,
}: CollectionViewProps) {
  const [data, setData] = useState<T[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const columns = useMemo(() => getColumns(collectionName), [collectionName]);
  const fields = useMemo(() => getFields(collectionName), [collectionName]);
  const searchKey = useMemo(() => getSearchKey(collectionName), [collectionName]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/${collectionName}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [collectionName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddRecord = () => {
    setEditingRecord(null);
    setIsDialogOpen(true);
  };

  const handleEditRecord = (record: T) => {
    setEditingRecord(record);
    setIsDialogOpen(true);
  };

  const handleImport = () => {
    setIsImportOpen(true);
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
      const response = await fetch(`/api/${collectionName}/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to delete record:", error);
    }
  };

  const handleSaveRecord = async (formData: any) => {
    const isEditing = !!editingRecord;
    const url = isEditing
      ? `/api/${collectionName}/${editingRecord._id || editingRecord.id}`
      : `/api/${collectionName}`;
    const method = isEditing ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.success) {
        fetchData();
      } else {
        alert(result.error || "Failed to save record");
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Failed to save record:", error);
      throw error;
    }
  };

  const enhancedColumns: Column<any>[] = [
    ...columns,
    {
      header: "Actions",
      accessorKey: "_id",
      cell: (item: any) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-indigo-600"
            onClick={() => handleEditRecord(item)}
          >
            <Pencil size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-rose-600"
            onClick={() => handleDeleteRecord(item._id || item.id || "")}
          >
            <Trash size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <CollectionHeader
        title={title}
        count={data.length}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddRecord={handleAddRecord}
        onImportCSV={handleImport}
        onImportExcel={handleImport}
      />
      <CollectionTable
        data={data}
        columns={enhancedColumns}
        searchKey={searchKey as any}
        searchTerm={searchTerm}
      />
      <RecordDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveRecord}
        title={editingRecord ? `Edit ${title}` : `Add ${title}`}
        fields={fields}
        initialData={editingRecord}
      />
      <ImportDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        collectionName={collectionName}
        schemaFields={fields.map((f: any) => ({ name: f.name, label: f.label }))}
        onImportComplete={fetchData}
      />
    </div>
  );
}

