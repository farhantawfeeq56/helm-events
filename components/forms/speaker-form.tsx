"use client";

import { useState } from "react";

type SpeakerFormState = {
  fullName: string;
  email: string;
  company: string;
  title: string;
  bio: string;
  topic: string;
  availabilityStatus: string;
};

const initialState: SpeakerFormState = {
  fullName: "",
  email: "",
  company: "",
  title: "",
  bio: "",
  topic: "",
  availabilityStatus: "pending",
};

export function SpeakerForm() {
  const [form, setForm] = useState<SpeakerFormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/speakers", {
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
        throw new Error(result.error ?? "Failed to create speaker.");
      }

      setForm(initialState);
      setMessage("Speaker created successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField<Key extends keyof SpeakerFormState>(
    key: Key,
    value: SpeakerFormState[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg shadow-slate-200/60 backdrop-blur"
    >
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-slate-900">Create speaker</h2>
        <p className="text-sm text-slate-600">
          Capture the essentials for session planning.
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Full name</span>
        <input
          required
          value={form.fullName}
          onChange={(event) => updateField("fullName", event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
          placeholder="Asha Menon"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            placeholder="asha@example.com"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Topic</span>
          <input
            required
            value={form.topic}
            onChange={(event) => updateField("topic", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            placeholder="Operational AI workflows"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Company</span>
          <input
            value={form.company}
            onChange={(event) => updateField("company", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            placeholder="Helm Events"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Title</span>
          <input
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            placeholder="Operations Lead"
          />
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Bio</span>
        <textarea
          value={form.bio}
          onChange={(event) => updateField("bio", event.target.value)}
          className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
          placeholder="Speaker logistics lead focused on scheduling and delivery."
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">
          Availability status
        </span>
        <select
          value={form.availabilityStatus}
          onChange={(event) =>
            updateField("availabilityStatus", event.target.value)
          }
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-2xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-amber-300"
      >
        {isSubmitting ? "Saving speaker..." : "Save speaker"}
      </button>

      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}
