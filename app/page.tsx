import { EventForm } from "@/components/forms/event-form";
import { SpeakerForm } from "@/components/forms/speaker-form";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.16),_transparent_22%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-6 py-10 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-sky-200 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
              AI Event Ops Agent
            </span>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Event operations data layer built for fast intake.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Create events and speakers from a lightweight control panel while
              the App Router API stores structured operational data in MongoDB
              Atlas through Mongoose models.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-slate-200/60 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Included collections
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "Events",
                "Speakers",
                "Sponsors",
                "Sessions",
                "Rooms",
                "Volunteers",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <EventForm />
          <SpeakerForm />
        </section>
      </div>
    </main>
  );
}
