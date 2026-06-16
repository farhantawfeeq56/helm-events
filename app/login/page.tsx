import { connectToDatabase } from "@/lib/db";
import { Organizer } from "@/models/organizer";
import { LoginForm, type DemoOrganizer } from "./login-form";

export const dynamic = "force-dynamic";

/** The 3 most recent organizers, surfaced as quick sign-in shortcuts. */
async function getTopOrganizers(): Promise<DemoOrganizer[]> {
  try {
    await connectToDatabase();
    const docs = (await Organizer.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select("fullName email")
      .lean()) as Array<{ fullName?: string; email?: string }>;
    return docs
      .filter((d) => d.email)
      .map((d) => ({ name: d.fullName || d.email!, email: d.email! }));
  } catch {
    return [];
  }
}

export default async function LoginPage() {
  const demoOrganizers = await getTopOrganizers();
  return <LoginForm demoOrganizers={demoOrganizers} />;
}
