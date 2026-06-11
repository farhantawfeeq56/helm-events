import { connectToDatabase } from "@/lib/db";
import { Task } from "@/models/task";
import "@/models/incident";
import "@/models/event";

export async function getTaskById(id: string) {
  await connectToDatabase();
  const task = await Task.findById(id)
    .populate("incidentId")
    .populate("eventId")
    .lean();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return task as any;
}
