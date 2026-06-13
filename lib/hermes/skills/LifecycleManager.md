# Skill: Lifecycle Manager

The Lifecycle Manager tracks the evolution of an incident from the first signal to final resolution. It is responsible for the granular tracking of progress via the `ExecutionChecklist` and the `Timeline` updates.

## 1. Execution Checklist Data Contract

Once an action is approved, Hermes generates or refines a set of `ChecklistItem` objects. These are rendered in the `ExecutionChecklist` UI component.

### TypeScript Interface
```typescript
export interface ChecklistItem {
  text: string;
  status: "pending" | "in-progress" | "completed";
}
```

### JSON Schema Snippet
```json
[
  { "text": "Locate backup 5G hotspots in storage", "status": "completed" },
  { "text": "Deliver hotspots to Hall B Information Desk", "status": "in-progress" },
  { "text": "Test connectivity with TechCorp demo laptop", "status": "pending" }
]
```

## 2. Status Transition Logic

Hermes monitors the status of these items and propagates the overall incident state:

- **All Pending**: Incident is `Open`.
- **At least one In-Progress or Completed**: Incident is `In Progress`.
- **All Completed**: Incident is ready for the `Resolved` state.

## 3. The Activity Log (Timeline)

The `executionStatus` field in the `Incident` model acts as the "Heartbeat" of the incident. The Lifecycle Manager updates this field to reflect the most recent action taken, providing a chronological narrative of the response.

### Example Timeline Updates:
1. `10:00` - "Incident detected: Wi-Fi failure in Hall B."
2. `10:05` - "Strategy approved: Deploy cellular hotspots."
3. `10:08` - "Task assigned: Volunteer John D. retrieving hotspots."
4. `10:15` - "Connectivity restored at Booth 42."

## 4. Post-Incident Analysis (AAR)

The Lifecycle Manager preserves the history of an incident for the **After Action Report**. It tracks:
- **MTTR (Mean Time To Resolution)**: Total duration from report to resolution.
- **Task Velocity**: How quickly checklist items were completed.
- **Resource Efficiency**: Which team members were involved and for how long.
