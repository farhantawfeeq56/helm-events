"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  UploadSimple,
  Table as TableIcon,
  CheckCircle,
  Warning,
  Spinner,
  CaretRight,
  CaretLeft,
  XCircle,
} from "@phosphor-icons/react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  collectionName: string;
  schemaFields: { name: string; label: string }[];
  onImportComplete: () => void;
}

type Step = "upload" | "mapping" | "preview" | "executing" | "result";

export function ImportDialog({
  isOpen,
  onClose,
  collectionName,
  schemaFields,
  onImportComplete,
}: ImportDialogProps) {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    count: number;
    errorCount?: number;
    message: string;
    errors?: string[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };

  const processFile = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();

    if (file.name.endsWith(".csv")) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setRawHeaders(results.meta.fields || []);
          setRawData(results.data);
          generateAutoMapping(results.meta.fields || []);
        },
      });
    } else {
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (json.length > 0) {
          const headers = json[0] as string[];
          const rows = json.slice(1).map((row: any) => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = row[index];
            });
            return obj;
          });
          setRawHeaders(headers);
          setRawData(rows);
          generateAutoMapping(headers);
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  const generateAutoMapping = async (headers: string[]) => {
    try {
      const response = await fetch("/api/import/mapping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headers, collection: collectionName }),
      });
      const data = await response.json();
      if (data.success) {
        setMapping(data.mapping);
      }
      setStep("mapping");
    } catch (error) {
      console.error("Mapping failed", error);
      setStep("mapping");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMappingChange = (header: string, field: string) => {
    setMapping((prev) => ({
      ...prev,
      [header]: field === "ignore" ? "" : field,
    }));
  };

  const getMappedData = () => {
    return rawData.map((row) => {
      const mappedRow: any = {};
      Object.entries(mapping).forEach(([header, field]) => {
        if (field) {
          mappedRow[field] = row[header];
        }
      });
      return mappedRow;
    });
  };

  const executeImport = async () => {
    setIsProcessing(true);
    setStep("executing");
    const dataToImport = getMappedData();

    try {
      const response = await fetch("/api/import/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collection: collectionName,
          data: dataToImport,
        }),
      });
      const result = await response.json();
      setImportResult(result);
      setStep("result");
      if (result.success) {
        onImportComplete();
      }
    } catch (error) {
      setImportResult({
        success: false,
        count: 0,
        message: "A network error occurred during import.",
      });
      setStep("result");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setStep("upload");
    setFile(null);
    setRawHeaders([]);
    setRawData([]);
    setMapping({});
    setImportResult(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UploadSimple weight="bold" />
            Bulk Import: {collectionName.charAt(0).toUpperCase() + collectionName.slice(1)}
          </DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to populate your {collectionName} collection.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden py-4">
          {step === "upload" && (
            <div
              className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-12 hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="bg-indigo-50 p-4 rounded-full text-indigo-600 mb-4">
                {isProcessing ? (
                  <Spinner size={32} className="animate-spin" />
                ) : (
                  <UploadSimple size={32} />
                )}
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                {isProcessing ? "Processing file..." : "Drop your file here or click to browse"}
              </h3>
              <p className="text-slate-500 mt-1">Supports .csv, .xlsx, .xls</p>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
              />
            </div>
          )}

          {step === "mapping" && (
            <div className="space-y-4 flex flex-col h-full">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <TableIcon weight="bold" />
                  Map File Headers to Fields
                </h3>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  AI Suggested Mappings
                </Badge>
              </div>
              <ScrollArea className="flex-1 border rounded-xl">
                <Table>
                  <TableHeader className="bg-slate-50 sticky top-0">
                    <TableRow>
                      <TableHead>File Header</TableHead>
                      <TableHead>Sample Value</TableHead>
                      <TableHead>Database Field</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rawHeaders.map((header) => (
                      <TableRow key={header}>
                        <TableCell className="font-medium">{header}</TableCell>
                        <TableCell className="text-slate-500 italic max-w-[200px] truncate">
                          {String(rawData[0]?.[header] || "")}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={mapping[header] || "ignore"}
                            onValueChange={(v) => handleMappingChange(header, v)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select field..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ignore">
                                <span className="text-slate-400">Ignore this column</span>
                              </SelectItem>
                              {schemaFields.map((field) => (
                                <SelectItem key={field.name} value={field.name}>
                                  {field.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-4 flex flex-col h-full">
              <h3 className="font-semibold text-slate-900">Preview Data (First 10 rows)</h3>
              <ScrollArea className="flex-1 border rounded-xl">
                <Table>
                  <TableHeader className="bg-slate-50 sticky top-0">
                    <TableRow>
                      {schemaFields
                        .filter((f) => Object.values(mapping).includes(f.name))
                        .map((f) => (
                          <TableHead key={f.name}>{f.label}</TableHead>
                        ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getMappedData()
                      .slice(0, 10)
                      .map((row, i) => (
                        <TableRow key={i}>
                          {schemaFields
                            .filter((f) => Object.values(mapping).includes(f.name))
                            .map((f) => (
                              <TableCell key={f.name}>{String(row[f.name] || "")}</TableCell>
                            ))}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-start gap-3">
                <Warning className="text-amber-600 mt-0.5" size={18} weight="bold" />
                <p className="text-sm text-amber-700">
                  Ready to import <strong>{rawData.length}</strong> records into <strong>{collectionName}</strong>.
                </p>
              </div>
            </div>
          )}

          {step === "executing" && (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="relative">
                <div className="h-24 w-24 rounded-full border-4 border-slate-100 animate-pulse" />
                <Spinner
                  size={48}
                  className="absolute inset-0 m-auto text-indigo-600 animate-spin"
                />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-6">Importing Data</h3>
              <p className="text-slate-500 mt-2">Writing to database, please wait...</p>
            </div>
          )}

          {step === "result" && importResult && (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center">
              <div
                className={`p-4 rounded-full mb-4 ${
                  importResult.success ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                }`}
              >
                {importResult.success ? (
                  <CheckCircle size={48} weight="fill" />
                ) : (
                  <XCircle size={48} weight="fill" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{importResult.message}</h3>
              
              {importResult.errorCount ? (
                <div className="mt-6 w-full max-w-md">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <Warning className="text-rose-500" weight="bold" />
                    Error Summary ({importResult.errorCount} failures)
                  </h4>
                  <div className="bg-slate-50 rounded-xl p-4 text-left text-xs font-mono overflow-auto max-h-40">
                    {importResult.errors?.map((err, i) => (
                      <div key={i} className="text-rose-600 mb-1">
                        • {err}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 mt-2 max-w-md">
                  The data hub has been updated with the new records.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          {step === "mapping" && (
            <>
              <Button variant="ghost" onClick={() => setStep("upload")}>
                <CaretLeft weight="bold" className="mr-2" />
                Change File
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => setStep("preview")}
                disabled={Object.values(mapping).filter(Boolean).length === 0}
              >
                Next: Preview
                <CaretRight weight="bold" className="ml-2" />
              </Button>
            </>
          )}

          {step === "preview" && (
            <>
              <Button variant="ghost" onClick={() => setStep("mapping")}>
                <CaretLeft weight="bold" className="mr-2" />
                Back to Mapping
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={executeImport}>
                Execute Import
                <UploadSimple weight="bold" className="ml-2" />
              </Button>
            </>
          )}

          {step === "result" && (
            <Button className="bg-slate-900 text-white" onClick={handleClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
