"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Database, Lightning, Trash, CircleNotch } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

export function DemoGenerator() {
  const [isOpen, setIsOpen] = useState(false);
  const [size, setSize] = useState("small");
  const [clearPrevious, setClearPrevious] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/demo/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ size, clearPrevious }),
      });

      const result = await response.json();
      if (result.success) {
        setIsOpen(false);
        router.refresh();
        alert(result.message);
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      console.error("Failed to generate demo data:", error);
      alert("Failed to generate demo data.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700 transition-all hover:border-indigo-200 hover:bg-indigo-50/30 h-auto"
        >
          <div className="flex items-center gap-2">
            <Database size={16} className="text-indigo-600" />
            <span>Generate Sample Event</span>
          </div>
          <Lightning size={14} weight="fill" className="text-amber-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Demo Data</DialogTitle>
          <DialogDescription>
            Create a realistic event with speakers, sessions, and attendees.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="size">Event Size</Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger id="size">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small (100 attendees)</SelectItem>
                <SelectItem value="medium">Medium (500 attendees)</SelectItem>
                <SelectItem value="large">Large (5000 attendees)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="clear"
              checked={clearPrevious}
              onCheckedChange={(checked) => setClearPrevious(!!checked)}
            />
            <Label
              htmlFor="clear"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Clear existing demo data
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isGenerating ? (
              <>
                <CircleNotch size={16} className="mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Event"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
