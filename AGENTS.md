# Hermes: Event Operations Intelligence

Hermes is the AI-driven operational assistant for the Helm Events platform. It is designed to provide real-time situational awareness, incident analysis, and automated response recommendations for large-scale events.

## Identity & Persona
- **Name:** Hermes
- **Role:** Event Operations Intelligence (EOI)
- **Voice:** Professional, concise, and action-oriented. Hermes focuses on data-driven insights and clear operational paths.
- **Mission:** To minimize incident resolution time and ensure seamless event execution by augmenting human decision-making.

## Architecture

The Hermes agent is built using a modern, scalable architecture integrated with Google Cloud Platform (GCP).

### Reasoning Engine
- **Model:** Google Vertex AI (Gemini 1.5 Pro)
- **Capabilities:** High-context window for processing complex event schedules, multi-modal capabilities for analyzing floor plans or technical diagrams, and advanced reasoning for risk assessment.

### Execution Layer
- **Logic:** GCP Cloud Functions serve as the primary execution environment for agent tools.
- **Tool Calling:** Hermes can trigger specific functions to:
    - Update event schedules.
    - Notify staff via SMS/Push notifications.
    - Query historical incident data for pattern matching.
    - Adjust resource allocations in real-time.

### Data Strategy
- **Primary Database:** MongoDB (via Mongoose)
- **Real-time Feed:** Transitioning from mock incident data to a live stream of event logs, attendee feedback, and sensor data (if available).
- **Contextual Memory:** Utilizing vector embeddings to store and retrieve relevant operational protocols and past event "after-action" reports.

## Current Project Status

### Phase 1: Operational Dashboard (Refactoring)
- Moving from a chat-focused UI to a structured operational dashboard.
- Implementing clear sections for Impact Analysis, Risk Assessment, Response Options, and Communications.
- Streamlining incident intake and response workflows.

### Phase 2: GCP Integration (In Progress)
- Setting up Vertex AI API connection for structured operational output.
- Defining Cloud Functions for core operational tools.
- Implementing the API bridge for GCP services.

### Phase 3: Data Live-streaming (Planned)
- Connecting Hermes to the live MongoDB event stream.
- Implementing real-time dashboard updates based on Hermes' actions.

## Guidelines for Developers
- **Component Reusability:** Keep agent-specific UI components in `components/agent/`.
- **Operational Clarity:** Prioritize structured data and clear action paths over chat bubbles.
- **Type Safety:** Use the serializable data models defined in `lib/hermes.ts`.
- **Core Logic (SOUL):** Refer to `lib/hermes/SOUL.md` for the agent's identity and operational OODA loop.
- **Operational Skills:** Detailed documentation for specific capabilities can be found in `lib/hermes/skills/`:
    - [Incident Intelligence](lib/hermes/skills/IncidentIntelligence.md)
    - [Strategy Orchestrator](lib/hermes/skills/StrategyOrchestrator.md)
    - [Operational Bridge](lib/hermes/skills/OperationalBridge.md)
    - [Lifecycle Manager](lib/hermes/skills/LifecycleManager.md)
    - [Field Intelligence](lib/hermes/skills/FieldIntelligence.md)
- **Documentation:** Update these files as architectural decisions evolve or new tools are added to Hermes' repertoire.
