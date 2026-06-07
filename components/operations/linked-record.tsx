"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowSquareOut } from "@phosphor-icons/react";

interface LinkedRecordProps {
  id: string;
  collection: string;
  label: string;
}

export function LinkedRecord({ id, collection, label }: LinkedRecordProps) {
  if (!id) return <span className="text-slate-400">N/A</span>;

  return (
    <Link
      href={`/operations?collection=${collection}&id=${id}`}
      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 hover:underline"
    >
      {label}
      <ArrowSquareOut size={12} />
    </Link>
  );
}

interface LinkedRecordsProps {
  ids: string[];
  collection: string;
  labels: string[];
}

export function LinkedRecords({ ids, collection, labels }: LinkedRecordsProps) {
  if (!ids || ids.length === 0) return <span className="text-slate-400">None</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {ids.map((id, index) => (
        <LinkedRecord
          key={id}
          id={id}
          collection={collection}
          label={labels[index] || id}
        />
      ))}
    </div>
  );
}
