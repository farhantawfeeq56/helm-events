# Skill: Field Intelligence

Field Intelligence provides Hermes with spatial awareness and allows for the processing of field reports from volunteers. It populates the `IssueReportCard` (ReportedIssue) data contract.

## 1. The Issue Report Data Contract (IssueReportCard)

When a volunteer submits a report, Hermes parses the text and maps it to the `ReportedIssue` interface, adding "Extracted Signals" and "Guidance" to assist operators.

### TypeScript Interface
```typescript
export interface ReportedIssue {
  id: string;
  category: "Technical" | "Medical" | "Security" | "Facility" | "Logistics" | "General";
  description: string;
  location: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  extractedSignals: string[];
  guidance: string;
  status: string;
  timestamp: string;
}
```

### JSON Schema Snippet
```json
{
  "id": "rep-456",
  "category": "Facility",
  "location": "Main Stage - Stage Right",
  "description": "Large water spill near the primary speaker monitor. Risk of slip and equipment damage.",
  "severity": "High",
  "extractedSignals": ["Liquid Spill", "Electrical Hazard", "Stage Right"],
  "guidance": "Cordon off the area immediately. Dispatch janitorial for cleanup and AV tech to check the monitor cables.",
  "status": "New",
  "timestamp": "1m ago"
}
```

## 2. Signal Extraction (Extracted Signals)

Hermes identifies specific entities and risks within a field report. These signals are displayed as keyword tags in the UI to allow for rapid triage.

- **Keywords**: "Spill", "Crowd", "Lost", "Heat", "Noise".
- **Equipment**: "Monitor", "Hotspot", "Radio", "Mic".
- **Risk Markers**: "Emergency", "ASAP", "Hazard", "Safety".

## 3. Operational Guidance

The `guidance` field is Hermes' immediate advice for the person who received the report. It should be:
- **First-Response Oriented**: What to do in the first 60 seconds.
- **Safety-First**: Prioritize containing the situation.
- **Example**: "Keep the crowd back 5 feet. Do not touch the spilled liquid until identified."

## 4. Spatial Mapping

Field Intelligence maps the `location` string to the known venue layout. If a volunteer says "near the big screen," Hermes translates this to "Main Stage South" or "Hall A Entrance" based on the event's logical node map.
