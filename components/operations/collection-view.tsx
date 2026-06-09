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
  latestEventId?: string;
  incidentId?: string;
  initialSearchTerm?: string;
}

export function CollectionView<T extends { _id: string; id?: string }>({
  title,
  collectionName,
  latestEventId,
  incidentId,
  initialSearchTerm = "",
}: CollectionViewProps) {
  const [data, setData] = useState<T[]>([]);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialSearchTerm);
  
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle initialSearchTerm changes from props
  useEffect(() => {
    if (initialSearchTerm) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const columns = useMemo(() => getColumns(collectionName), [collectionName]);
  const fields = useMemo(() => getFields(collectionName), [collectionName]);
  const searchKey = useMemo(() => getSearchKey(collectionName), [collectionName]);

  const fetchData = useCallback(async (page = 1, search = debouncedSearchTerm) => {
    setIsLoading(true);
    try {
      const url = new URL(`/api/${collectionName}`, window.location.origin);
      url.searchParams.append("page", page.toString());
      url.searchParams.append("limit", pagination.limit.toString());
      
      if (search) {
        url.searchParams.append("search", search);
      }
      
      if (latestEventId && collectionName !== "events") {
        url.searchParams.append("eventId", latestEventId);
      }
      if (incidentId && collectionName === "tasks") {
        url.searchParams.append("incidentId", incidentId);
      }
      const response = await fetch(url.toString());
      const result = await response.json();
      if (result.success) {
        setData(result.data);
        if (result.pagination) {
          setPagination(result.pagination);
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [collectionName, latestEventId, incidentId, pagination.limit, debouncedSearchTerm]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData(1, debouncedSearchTerm);
    // We want to fetch data when these dependencies change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, debouncedSearchTerm, latestEventId, incidentId]);

  const handlePageChange = (newPage: number) => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchData(newPage, debouncedSearchTerm);
  };

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
        await fetchData(pagination.page, debouncedSearchTerm);
      }
    } catch (error) {
      console.error("Failed to delete record:", error);
    }
  };

  const handleSaveRecord = async (formData: unknown) => {
    const isEditing = !!editingRecord;
    const url = isEditing
      ? `/api/${collectionName}/${editingRecord._id || editingRecord.id}`
      : `/api/${collectionName}`;
    const method = isEditing ? "PATCH" : "POST";

    const dataToSend = { ...(formData as Record<string, unknown>) };

    // Automatically assign eventId for new records if not present
    if (!isEditing && latestEventId && collectionName !== "events" && !dataToSend.eventId) {
      dataToSend.eventId = latestEventId;
    }
    // Automatically assign incidentId for new tasks if present
    if (!isEditing && incidentId && collectionName === "tasks" && !dataToSend.incidentId) {
      dataToSend.incidentId = incidentId;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
      const result = await response.json();
      if (result.success) {
        await fetchData(pagination.page, debouncedSearchTerm);
      } else {
        alert(result.error || "Failed to save record");
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Failed to save record:", error);
      throw error;
    }
  };

  const enhancedColumns: Column<T>[] = [
    ...columns,
    {
      header: "Actions",
      accessorKey: "_id" as keyof T,
      cell: (item: T) => (
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
        count={pagination.total}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddRecord={handleAddRecord}
        onImportCSV={handleImport}
        onImportExcel={handleImport}
      />
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      ) : (
        <CollectionTable
          data={data}
          columns={enhancedColumns}
          searchKey={searchKey as keyof T}
          searchTerm={searchTerm}
          isServerSide={true}
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          onPageChange={handlePageChange}
        />
      )}
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
        schemaFields={fields.map((f: { name: string; label: string }) => ({ name: f.name, label: f.label }))}
        onImportComplete={() => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          fetchData(pagination.page, debouncedSearchTerm);
        }}
        latestEventId={latestEventId}
      />
    </div>
  );
}
