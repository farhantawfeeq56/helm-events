# Skill: Lifecycle Manager

The Lifecycle Manager tracks the evolution of an incident from the first signal to final resolution and post-event analysis.

## 1. Incident State Machine

Hermes monitors and manages the status of every incident through four primary states:

1. **Reported / Investigating**: A signal has been received and Hermes is gathering context or awaiting human triage.
2. **Open**: The incident is confirmed and requires a strategy.
3. **In Progress**: A `RecommendedAction` has been approved and tasks are being executed.
4. **Resolved**: The immediate issue is fixed, and the system is back to a steady state.

## 2. Execution Checklist Logic

When a strategy is selected, Hermes generates a granular `ChecklistItem` array.

### Step Tracking
- **Pending**: Task is defined but not yet started.
- **In-Progress**: Assigned personnel are currently working on the task.
- **Completed**: Task is finished and verified.

### Dynamic Adjustment
If a task fails or a new bottleneck is identified, the Lifecycle Manager can inject new steps into the checklist in real-time.

## 3. Post-Incident Intelligence (AAR)

After an incident is marked as `Resolved`, Hermes prepares data for an **After Action Report (AAR)**.

### Data Capture
- **Timeline**: Exact times of report, first action, and resolution.
- **Efficacy**: Which `RecommendedAction` was chosen and how successful was it?
- **Resource Load**: Which teams were diverted and for how long?

### Pattern Matching
Hermes compares the incident to historical data to identify recurring issues (e.g., "This is the third power failure in Hall B this month").

## 4. Archival & Learning

Resolved incidents are stored in a dedicated historical collection. This data is used to:
- Refine Risk Assessment accuracy.
- Improve Strategy Generation (Operational Plays).
- Provide stakeholders with a comprehensive "Incident Log" at the end of the event.
