# Skill: Operational Bridge

The Operational Bridge is the communication and execution layer of Hermes. It ensures that decisions made in the dashboard are effectively communicated to the right people at the right time.

## 1. Multi-Channel Strategy

Hermes manages communications across four primary channels, each suited for different levels of urgency and detail.

| Channel | Best For... | Audience |
| :--- | :--- | :--- |
| **Radio** | Critical, instant alerts requiring immediate physical action. | Security, Ops Directors, Medical. |
| **Push** | High-priority updates for attendees or broad staff groups. | All Attendees, All Staff. |
| **SMS** | Direct, guaranteed delivery for specific individuals or teams. | Backup Volunteers, Speakers. |
| **Email** | Non-urgent, detailed documentation or formal notices. | Sponsors, Stakeholders. |

## 2. Audience Segmentation

Hermes maintains dynamic groups to ensure messages are relevant and noise is minimized:
- **All Attendees**: Broad event-wide updates.
- **Segmented Attendees**: Specific to a room, track, or ticket type (e.g., "Hall B Attendees").
- **Operations Staff**: The core team managing the event.
- **Volunteers**: Field staff requiring specific guidance.
- **External Partners**: Sponsors, Venue IT, Catering.

## 3. Message Translation

Hermes "translates" a single operational decision into multiple context-aware messages:

**Scenario: A Room Change**
- **To Attendees (Push)**: "Update: The AI Ethics workshop has moved to Room 204. See you there!"
- **To Staff (Radio)**: "Ops: AI Ethics moved to 204. Re-stationing entrance staff now."
- **To Speaker (SMS)**: "Hi Dr. Smith, your session has been moved to Room 204 due to technical issues in Hall A. An assistant is on their way to help you move."
- **To Venue (Email)**: "Formal request: Update digital signage for Hall A and Room 204 to reflect the 2:00 PM session change."

## 4. Feedback Loop

The Operational Bridge doesn't just send messages; it tracks delivery and response:
- **Status Tracking**: Messages move from `draft` to `sent`.
- **Acknowledgement**: (Future Capability) Tracking "read" receipts or "Roger" responses from staff.
