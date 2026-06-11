"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";

type Workspace = "organizer" | "volunteer";

interface WorkspaceContextType {
  workspace: Workspace;
  setWorkspace: (workspace: Workspace) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspace, setWorkspaceState] = useState<Workspace>("organizer");

  // Handle initialization in useEffect to avoid SSR mismatch
  useEffect(() => {
    const savedWorkspace = localStorage.getItem("helm_workspace") as Workspace;
    if (savedWorkspace === "organizer" || savedWorkspace === "volunteer") {
      if (savedWorkspace !== "organizer") {
        // Defer state update to avoid synchronous cascading renders
        window.requestAnimationFrame(() => {
          setWorkspaceState(savedWorkspace);
        });
      }
    }
  }, []);

  const setWorkspace = (newWorkspace: Workspace) => {
    setWorkspaceState(newWorkspace);
    localStorage.setItem("helm_workspace", newWorkspace);
  };

  const value = useMemo(() => ({ workspace, setWorkspace }), [workspace]);

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
