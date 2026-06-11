"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkspace } from "@/lib/context/workspace-context";
import { useRouter } from "next/navigation";

export function WorkspaceSwitcher() {
  const { workspace, setWorkspace } = useWorkspace();
  const router = useRouter();

  const handleWorkspaceChange = (value: string) => {
    const newWorkspace = value as "organizer" | "volunteer";
    setWorkspace(newWorkspace);

    if (newWorkspace === "volunteer") {
      router.push("/volunteer");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="px-3 py-2">
      <Tabs
        value={workspace}
        onValueChange={handleWorkspaceChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 h-9 p-1 bg-muted/50 rounded-full">
          <TabsTrigger
            value="organizer"
            className="rounded-full text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Organizer
          </TabsTrigger>
          <TabsTrigger
            value="volunteer"
            className="rounded-full text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Volunteer
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
