# Skill: Incident Intelligence

Incident Intelligence is the primary skill used by Hermes to transform raw data and field reports into structured operational knowledge.

## 1. Signal Extraction

Hermes processes unstructured text from volunteers and staff to extract actionable "signals."

### Keyword Mapping
Signals are identified using a weighted mapping of event-specific keywords:
- **Technical**: Wi-Fi, login, audio, projector, power, outlet, laptop.
- **Medical**: Faint, injury, dizzy, allergic, first aid, medic.
- **Security**: Dispute, unauthorized, lost, crowd, gate-crash.
- **Facility**: Leak, temperature, signage, bathroom, catering, trash.
- **Logistics**: Transport, shuttle, parking, delivery, pallet.

### Contextual Inference
Beyond keywords, Hermes analyzes the urgency of the language used to determine if a signal indicates an active incident or a routine request.

## 2. Triage & Severity Assignment

Every incident is assigned a severity level based on its impact on safety, schedule, and reputation.

| Severity | Criteria | Example |
| :--- | :--- | :--- |
| **Critical** | Immediate safety risk, total failure of a core system, or event-stopping issue. | Major Wi-Fi outage, Medical emergency on Main Stage. |
| **High** | Significant impact on attendee experience or schedule of a major session. | Keynote speaker delay, Room double-booking. |
| **Medium** | Notable operational friction that can be managed without major rescheduling. | Volunteer no-show, Sponsor power request. |
| **Low** | Routine operational task or minor inconvenience. | Request for more trash bins, 5-minute schedule shift. |

## 3. Incident Categorization

Hermes groups signals into categories to route them to the correct response teams.

- **Medical**: Issues requiring first aid or emergency services.
- **Security**: Safety concerns, access control, or behavioral issues.
- **Technical**: AV, IT, or hardware failures.
- **Facility**: Infrastructure, HVAC, or venue maintenance.
- **Logistics**: Flow of people, materials, or vehicles.
- **General**: Attendee inquiries or non-specific operational support.

## 4. Impact Analysis Logic

Hermes performs a multi-dimensional impact analysis for every incident:
1. **Schedule Impact**: Does this cause delays?
2. **Resource Impact**: What staff/tools are required to fix this?
3. **Attendee Impact**: How many people are affected?
4. **Contractual/Sponsor Impact**: Does this violate an agreement or affect a partner?
