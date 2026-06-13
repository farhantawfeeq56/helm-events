# Skill: Strategy Orchestrator

The Strategy Orchestrator is responsible for generating viable response paths for any given incident. It populates the `responseOptions` field of an `Incident`, which is rendered by the `ResponseOptions` UI component.

## 1. The Response Options Data Contract

Hermes must always aim to provide **3 distinct strategic options** for any High or Critical incident, allowing human operators to choose the best path based on real-time nuances.

### TypeScript Interface
```typescript
export interface RecommendedAction {
  id: number;
  title: string;
  summary: string;
  pros: string[];
  cons: string[];
  operationalConsiderations: string;
  status: "pending" | "approved" | "modified";
  priority: "high" | "medium" | "low";
  steps?: ChecklistItem[];
}
```

### JSON Schema Snippet (Array of 3)
```json
[
  {
    "id": 1,
    "title": "Deploy Backup Hotspots",
    "summary": "Immediately distribute 5G portable hotspots to the top 5 affected booths in Hall B.",
    "pros": ["Restores connectivity in < 10 mins", "Independent of venue IT"],
    "cons": ["Limited bandwidth", "High labor requirement for deployment"],
    "operationalConsiderations": "Prioritize 'TechCorp' and 'GlobalLink' booths as per sponsor tier.",
    "status": "pending",
    "priority": "high"
  },
  {
    "id": 2,
    "title": "Reroute to Workshop Stage B",
    "summary": "Move all Hall B workshops to the Stage B area which has a dedicated fiber line.",
    "pros": ["Guaranteed high-speed connection", "Maintains stream quality"],
    "cons": ["Causes 15min schedule delay", "Attendee confusion during relocation"],
    "operationalConsiderations": "Requires 3 volunteers to act as wayfinders.",
    "status": "pending",
    "priority": "medium"
  }
]
```

## 2. Option Diversity Requirements

To provide meaningful choice, Hermes should categorize options into these types:
1.  **Immediate Mitigation**: Quick, tactical fix to stop the "bleeding" (e.g., hotspots).
2.  **Structural Resolution**: Addressing the root cause or moving the operation (e.g., relocating).
3.  **Communication Focus**: Managing expectations while a fix is developed (e.g., status updates).

## 3. Operational Considerations

The `operationalConsiderations` field is critical. It should contain "insider" knowledge that Hermes has extracted from event briefs, such as:
- Sponsor tiers and priority.
- Staffing constraints.
- Venue-specific quirks (e.g., "Elevator 4 is slow, use the freight lift").
- Safety/Compliance notes.

## 4. Priority Mapping

- **high**: Actions that must be taken within 15 minutes to prevent escalation.
- **medium**: Actions that resolve the issue but allow for a larger planning window.
- **low**: "Nice to have" improvements or long-term monitoring.
