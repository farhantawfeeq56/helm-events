"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X } from "@phosphor-icons/react";

interface RelationshipSelectProps {
  collectionName: string;
  displayField: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  isMulti?: boolean;
}

export function RelationshipSelect({
  collectionName,
  displayField,
  value,
  onChange,
  placeholder = "Select...",
  isMulti = false,
}: RelationshipSelectProps) {
  const [options, setOptions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/${collectionName}`);
        const result = await response.json();
        if (result.success) {
          setOptions(result.data);
        }
      } catch (error) {
        console.error(`Failed to fetch ${collectionName}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && options.length === 0) {
      fetchOptions();
    }
  }, [collectionName, isOpen, options.length]);

  const filteredOptions = options.filter((option) =>
    (option[displayField] || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const selectedValues = Array.isArray(value)
    ? value.map((v) => (typeof v === "object" ? v._id : v))
    : value
    ? [typeof value === "object" ? (value as any)._id : value]
    : [];

  const handleSelect = (id: string) => {
    if (isMulti) {
      if (selectedValues.includes(id)) {
        onChange(selectedValues.filter((v) => v !== id));
      } else {
        onChange([...selectedValues, id]);
      }
    } else {
      onChange(id);
      setIsOpen(false);
    }
  };

  const getLabel = (id: string) => {
    const option = options.find((opt) => opt._id === id);
    return option ? option[displayField] : id;
  };

  return (
    <div className="flex flex-col gap-2">
      {isMulti && selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {selectedValues.map((id) => (
            <Badge key={id} variant="secondary" className="flex items-center gap-1">
              {getLabel(id)}
              <X
                size={12}
                className="cursor-pointer"
                onClick={() => handleSelect(id)}
              />
            </Badge>
          ))}
        </div>
      )}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between"
          >
            {isMulti
              ? "Select multiple..."
              : value
              ? getLabel(value as string)
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] p-0">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 focus-visible:ring-0"
            />
          </div>
          <ScrollArea className="h-60">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-slate-500">
                Loading...
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">
                No options found.
              </div>
            ) : (
              <div className="p-1">
                {filteredOptions.map((option) => (
                  <DropdownMenuItem
                    key={option._id}
                    onSelect={() => handleSelect(option._id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValues.includes(option._id)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {option[displayField]}
                  </DropdownMenuItem>
                ))}
              </div>
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
