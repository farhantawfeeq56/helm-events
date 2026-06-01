"use client";

import { useState } from "react";

type EventFormState = {
  name: string;
  description: string;
  venue: string;
  city: string;
  timezone: string;
  startDate: string;
  endDate: string;
  status: string;
};

const initialState: EventFormState = {
  name: "",
  description: "",
  venue: "",
  city: "",
  timezone: "Asia/Kolkata",
  startDate: "",
  endDate: "",
  status: "planning",
};

export function EventForm() {
  const [form, setForm] = useState<EventFormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = (await response.json()) as {
        success: boolean;
        error?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Failed to create event.");
      }

      setForm(initialState);
      setMessage("Event created successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField<Key extends keyof EventFormState>(
    key: Key,
    value: EventFormState[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg shadow-slate-200/60 backdrop-blur"
    >
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-slate-900">Create event</h2>
        <p className="text-sm text-slate-600">
          Store core operations data for a new event.
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Event name</span>
        <input
          required
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-0 transition focus:border-slate-400"
          placeholder="Helm Summit 2026"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Description</span>
        <textarea
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
          placeholder="Regional ops kickoff, speaker briefings, and sponsor activations."
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Venue</span>
          <input
            required
            value={form.venue}
            onChange={(event) => updateField("venue", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            placeholder="Convention Center Hall A"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">City</span>
          <input
            required
            value={form.city}
            onChange={(event) => updateField("city", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            placeholder="Bengaluru"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Start date</span>
          <input
            required
            type="datetime-local"
            value={form.startDate}
            onChange={(event) => updateField("startDate", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">End date</span>
          <input
            required
            type="datetime-local"
            value={form.endDate}
            onChange={(event) => updateField("endDate", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Timezone</span>
          <input
            required
            value={form.timezone}
            onChange={(event) => updateField("timezone", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            placeholder="Asia/Kolkata"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Status</span>
          <select
            value={form.status}
            onChange={(event) => updateField("status", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
          >
            <option value="planning">Planning</option>
            <option value="confirmed">Confirmed</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
          </select>
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSubmitting ? "Saving event..." : "Save event"}
      </button>

      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}
