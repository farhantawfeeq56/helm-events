# Skill: Operational Bridge

The Operational Bridge is the execution layer of Hermes. It translates high-level strategic decisions into concrete system actions, communications, and data state changes.

## 1. The Execution Layer

When a `RecommendedAction` is approved by an operator, the Operational Bridge triggers the following:

1.  **State Transition**: Updates the incident status from `Open` to `In Progress`.
2.  **Task Creation**: Converts the `steps` (ChecklistItems) into active assignments for field staff.
3.  **Communication Dispatch**: Sends the `CommunicationPlan` messages across the specified channels.

## 2. Multi-Channel Communications

Hermes manages a `CommunicationPlan[]` array for each incident, ensuring consistent messaging across different stakeholders.

### TypeScript Interface
```typescript
export interface CommunicationPlan {
  id: number;
  channel: "SMS" | "Push" | "Email" | "Radio";
  audience: string;
  message: string;
  status: "draft" | "sent";
}
```

### Channel Specifics
- **SMS**: Urgent alerts for Lead Staff and Speakers. (Action-oriented, short).
- **Push**: Mass notifications for Attendees. (Tone: Helpful, transparent).
- **Radio**: Scripted prompts for volunteers and security. (Tone: Tactical, phonetic where applicable).
- **Email**: Formal updates for sponsors, venue management, or post-event logs.

## 3. CRUD & State Management

The Bridge is responsible for the "Approved Plan to Reality" pipeline:

- **Pending -> Approved**: When an action is selected in the UI, the Bridge updates the database to reflect this choice.
- **Volunteer Assignments**: The Bridge maps specific `ChecklistItem` entries to the Volunteer Portal's task queue based on the `category` of the incident.
- **Activity Logging**: Every transition triggered by the Bridge is logged in the `executionStatus` terminal of the `OperationalCard`.

## 4. UI Feedback Loop

The `executionStatus` field in the `Incident` object serves as a real-time "terminal" for the operator. The Bridge updates this string as it performs background tasks:

- *"Drafting notifications..."*
- *"Dispatching technicians to Hall B..."*
- *"Updating mobile app schedule sync..."*
- *"Confirmed: TechCorp notified of power delay."*
