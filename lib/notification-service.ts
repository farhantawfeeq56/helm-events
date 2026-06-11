import { NotificationType } from "@/types/data-hub";

export type SendNotificationInput = {
  recipient: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  sourceId?: string;
};

export async function sendNotification(data: SendNotificationInput) {
  try {
    if (typeof window === "undefined") {
      // Server-side: Import models dynamically
      const { Notification } = await import("@/models/notification");
      const { connectToDatabase } = await import("@/lib/db");

      await connectToDatabase();
      const notification = await Notification.create({
        ...data,
        read: false,
      });
      return { success: true, data: notification };
    } else {
      // Client-side: Use the API route
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    }
  } catch (error) {
    console.error("Failed to send notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
