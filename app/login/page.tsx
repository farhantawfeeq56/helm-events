import { SignInForm } from "@/components/auth/sign-in-form";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getAuthSession();

  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-6 py-10 text-slate-900">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70">
        <div className="mb-6 space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
            Helm Auth
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Login
          </h1>
          <p className="text-sm leading-6 text-slate-600">
            Sign in with a Helm user email to open an authenticated session.
          </p>
        </div>

        <SignInForm />
      </div>
    </main>
  );
}
