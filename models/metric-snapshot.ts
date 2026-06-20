import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * A point-in-time capture of how an event's operation is performing. Snapshots
 * accumulate over time (driven by real operational activity + periodic capture)
 * to form the historical series the platform charts and trends against.
 *
 * Metrics are stored as explicit Number fields (not Mixed) so any single metric
 * can be queried/projected into a time-series efficiently.
 */
const metricsShape = {
  // Incidents
  incidentsTotal: { type: Number, default: 0 },
  incidentsOpen: { type: Number, default: 0 },
  incidentsActive: { type: Number, default: 0 },
  incidentsResolved: { type: Number, default: 0 },
  incidentsAcknowledged: { type: Number, default: 0 },
  incidentResolutionRate: { type: Number, default: 0 }, // %
  // Tasks
  tasksTotal: { type: Number, default: 0 },
  tasksOpen: { type: Number, default: 0 },
  tasksInProgress: { type: Number, default: 0 },
  tasksCompleted: { type: Number, default: 0 },
  taskCompletionRate: { type: Number, default: 0 }, // %
  avgTaskCompletionMins: { type: Number, default: 0 },
  // People
  volunteersTotal: { type: Number, default: 0 },
  volunteersActive: { type: Number, default: 0 },
  volunteersOnShift: { type: Number, default: 0 },
  organizersTotal: { type: Number, default: 0 },
  // Shifts
  shiftsTotal: { type: Number, default: 0 },
  shiftsActive: { type: Number, default: 0 },
  // Hermes / agent
  hermesIncidents: { type: Number, default: 0 },
  hermesActions: { type: Number, default: 0 },
  // Throughput
  actionsLastHour: { type: Number, default: 0 },
  // Composite health (0–100)
  operationalReadiness: { type: Number, default: 0 },
};

const metricSnapshotSchema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    capturedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    // What caused this capture: periodic view, an operational event, or manual.
    source: {
      type: String,
      enum: ["auto", "event", "manual"],
      default: "auto",
    },
    trigger: {
      type: String,
      trim: true,
      default: "",
    },
    metrics: {
      type: new Schema(metricsShape, { _id: false }),
      default: () => ({}),
    },
  },
  { timestamps: true },
);

// Fast "latest snapshot for this event" + range queries.
metricSnapshotSchema.index({ eventId: 1, capturedAt: -1 });

export type MetricSnapshotDocument = InferSchemaType<typeof metricSnapshotSchema>;

export const MetricSnapshot: Model<MetricSnapshotDocument> =
  models.MetricSnapshot || model<MetricSnapshotDocument>("MetricSnapshot", metricSnapshotSchema);
