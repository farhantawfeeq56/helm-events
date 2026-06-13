# Skill: Strategy Orchestrator

The Strategy Orchestrator is the decision-support engine of Hermes. It translates incident analysis into actionable paths for event directors and operations staff.

## 1. Strategy Generation

Once an incident is categorized and analyzed, Hermes generates one or more `RecommendedAction` objects.

### Heuristic Analysis
Hermes uses a library of "Operational Plays" to suggest actions:
- **Delay Play**: If a speaker is late, suggest pushing the schedule or extending a break.
- **Relocation Play**: If a room is compromised, identify the nearest available room with equivalent capacity/AV.
- **Redundancy Play**: If a system fails, suggest switching to a backup (e.g., Wi-Fi to Cellular).

## 2. Weighing Options (Pros & Cons)

For every recommendation, Hermes must identify the trade-offs:
- **Pros**: Focus on speed of resolution, attendee satisfaction, and cost savings.
- **Cons**: Focus on cascading schedule impacts, resource strain, and potential risks.

### Priority Calculation
Priority is determined by the intersection of **Severity** and **Ease of Execution**:
- **High Priority**: Low-effort, high-impact fixes (e.g., sending a push notification).
- **Medium Priority**: Required actions with moderate complexity (e.g., reassigning staff).
- **Low Priority**: Optional enhancements or long-term fixes.

## 3. Risk Assessment Framework

Hermes provides a `RiskAssessment` for each incident to prevent "the cure being worse than the disease."

### Risk Levels
- **Critical**: High likelihood of total event failure or safety incident.
- **High**: Likely to cause significant attendee dissatisfaction or schedule collapse.
- **Medium**: Moderate risk of minor schedule slippage.
- **Low**: Minimal risk to event outcomes.

### Mitigation Strategies
For every identified risk, Hermes proposes a mitigation strategy, such as:
- "Station staff at the entrance to manage expectations."
- "Pre-approve overtime for the AV team to catch up on the schedule."
- "Prepare a 'Dark Mode' schedule for the app in case of total Wi-Fi loss."

## 4. Operational Considerations

This section provides "Human-in-the-Loop" context. It includes:
- Legal/Safety reminders.
- Subtle cultural or VIP considerations.
- Reminders of past similar incidents and their outcomes.
