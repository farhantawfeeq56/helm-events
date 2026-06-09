import { ActivityDocument } from "@/models/activity";

export type LogActivityInput = {
  user: string;
  type: "human" | "agent";
  action: string;
  target: string;
  details?: string;
};

export async function logActivity(data: LogActivityInput) {
  try {
    if (typeof window === "undefined") {
      // Server-side: Import models dynamically to avoid bundling them for the client
      const { Activity } = await import("@/models/activity");
      const { connectToDatabase } = await import("@/lib/db");
      
      await connectToDatabase();
      const activity = await Activity.create({
        ...data,
        timestamp: new Date(),
      });
      return { success: true, data: activity };
    } else {
      // Client-side: Use the API route
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    }
  } catch (error) {
    console.error("Failed to log activity:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}
