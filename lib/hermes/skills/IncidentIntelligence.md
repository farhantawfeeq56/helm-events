# Skill: Incident Intelligence

Incident Intelligence is the primary skill used by Hermes to transform raw data and field reports into structured operational knowledge. This skill is responsible for populating the `Incident` data contract used by the `OperationalCard` UI component.

## 1. The Incident Data Contract (OperationalCard)

Every incident identified by Hermes must conform to the following schema, mapping directly to the `Incident` interface in `lib/hermes.ts`.

### TypeScript Interface
```typescript
export interface Incident {
  id: string;
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: string;
  timestamp: string;
  description: string; // Narrative Summary
  impactAnalysis: string[];
  responseOptions?: RecommendedAction[];
  riskAssessment?: RiskAssessment;
  communications?: CommunicationPlan[];
  executionStatus: string;
  iconName: string; // Phosphor Icon name
  color: string; // Tailwind color class (e.g., "red", "amber", "blue")
}
```

### JSON Schema Snippet
```json
{
  "id": "wifi-outage-hall-b",
  "title": "Critical Wi-Fi Outage",
  "severity": "Critical",
  "status": "Investigating",
  "timestamp": "2m ago",
  "description": "A major backbone switch in Hall B has failed, resulting in total loss of connectivity for 50+ exhibitor booths and the workshop stage.",
  "impactAnalysis": [
    "Exhibitor Demos",
    "Workshop Live Streams",
    "Attendee App Usage in Hall B"
  ],
  "executionStatus": "Initial alert received. Diagnosing hardware fault.",
  "iconName": "WifiHigh",
  "color": "red"
}
```

## 2. Signal Extraction & Narrative Summary

Hermes processes unstructured text to extract actionable "signals" and generates a **Narrative Summary** (stored in the `description` field).

- **Objective**: Synthesize multiple reports into a single, cohesive explanation of the issue.
- **Tone**: Clinical and precise.
- **Example**: Instead of "Someone said the wifi is down and another person is complaining about their demo," Hermes writes: "Connectivity failure reported in Hall B; affecting both public and private SSIDs."

## 3. Triage & Severity Assignment

Severity is determined by the potential for event disruption:

| Severity | Criteria |
| :--- | :--- |
| **Critical** | Immediate safety risk or total failure of a core event system (e.g., Main Stage AV, Venue-wide Wi-Fi). |
| **High** | Significant impact on major session schedules or high-priority attendee experiences. |
| **Medium** | Notable operational friction that can be managed without major rescheduling (e.g., single booth power issue). |
| **Low** | Routine operational task or minor inconvenience. |

## 4. Impact Analysis Logic

Hermes must identify at least three specific areas of impact for any incident of Medium severity or higher. These are displayed as tags in the UI to help operators quickly understand the scope.

- **Schedule**: Delays or cancellations.
- **Resource**: Diversion of staff or equipment.
- **Attendee**: Direct effect on the guest experience.
- **Partner/Sponsor**: Impact on contractual obligations or VIPs.
