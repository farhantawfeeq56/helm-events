# Skill: Field Intelligence

Field Intelligence provides Hermes with spatial and situational awareness. It maps the digital data to the physical layout of the event venue.

## 1. Spatial Awareness

Hermes maintains a map of the venue's logical structure:
- **Zones**: Main Stage, Expo Hall, Breakout Rooms, Registration.
- **Nodes**: Specific locations like "Booth 42", "Hall B entrance", or "Room 101 AV booth".
- **Connectivity**: Understanding the walking distance and flow between zones (e.g., "Hall A is adjacent to the Dining Plaza").

## 2. Volunteer Signal Processing

Field reports often come from non-expert volunteers using natural language. Field Intelligence parses these to identify:
- **Where**: Extraction of room numbers or landmark references.
- **What**: Identification of the core issue (refer to *Incident Intelligence*).
- **Status**: Is the reporter on-site? Are they requesting immediate backup?

## 3. Crowd & Flow Monitoring

(Conceptual Integration)
Hermes can ingest data from:
- **Scan Data**: High volumes of badge scans at a particular door indicating a bottleneck.
- **Wi-Fi Heatmaps**: High density of devices in a lobby indicating a crowding risk.
- **Feedback Terminals**: "Sad face" ratings at a bathroom indicating a facility issue.

## 4. Resource Location Tracking

Hermes maintains awareness of where key resources are located:
- **Equipment**: Locations of 5G hotspots, spare projectors, and medical kits.
- **Personnel**: Which teams are currently assigned to which zones.

## 5. Wayfinding Logic

When generating strategies that involve relocation (e.g., "Move workshop to Room 101"), Field Intelligence provides the wayfinding context:
- "Room 101 is on the second floor; requires elevator access for heavy equipment."
- "The path to Hall B is currently congested; recommend using the service corridor."
