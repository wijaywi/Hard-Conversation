# Hard Conversation
<p align="center">
  <img src="HC-Logo.png" alt="Logo" width="200" />
</p>

**Tagline:** Practice before it matters.

Hard Conversation is a controlled simulation environment where users rehearse high-stakes interpersonal interactions (like asking for a raise, or firing an employee). It is an adaptive roleplay engine that pushes back realistically, observes your responses, and provides actionable, evidence-based feedback.

Built for the **Shipaton 2026 Hackathon**.

## Features & Functionality

- **Deterministic Simulation Engine:** Unlike generic AI chatbots, Hard Conversation uses a strict Conversation Simulation Engine (CSE) that controls the flow, objectives, and pressure of the conversation, ensuring the AI persona pushes back realistically.
- **Dynamic Pressure System:** The AI's hostility and resistance adapt in real-time based on measurable signals extracted from the user's input (e.g., Clarity, Empathy, Boundary Strength). Yielding increases pressure; strong evidence paired with empathy de-escalates it.
- **Actionable Evaluation:** At the end of a simulation, a heavier LLM evaluates the conversation based on scenario-specific mathematical weights, identifying your strengths, weaknesses, and the exact "turning point" of the conversation.
- **Cinematic UI:** A minimalist, typography-heavy interface built to simulate a high-stakes environment, intentionally avoiding the standard "friendly chatbot" design.
- **Monetization (RevenueCat):** Integrated with RevenueCat to offer a Premium tier that unlocks "Brutal Mode" (Level 5 Pressure) and unlimited practice sessions.

## Architecture

The project is structured as a modern Node.js/TypeScript monorepo:

- **`apps/frontend`**: React Native (Expo) app utilizing Expo Router for navigation and RevenueCat (`react-native-purchases`) for the paywall.
- **`apps/backend`**: Fastify REST API server that connects the simulation engine to the Anthropic LLM API (Claude 3 Haiku for real-time turn analysis, Claude 3.5 Sonnet for deep evaluation).
- **`packages/engine`**: The core deterministic Conversation Simulation Engine, State Machine, and LLM Adapter prompt contracts.
- **`packages/scenarios`**: The library of highly structured scenario schemas that dictate AI behavior and success criteria.

## Hackathon Categories Targeted

- **Career Coaching (Leadership Heather Influencer Award):** Directly helps new and aspiring managers practice difficult workplace conversations and build confidence.
- **HAMM Award:** Features a clear monetization strategy via a RevenueCat-powered premium subscription paywall for power users.
- **Next Gen Award:** Fully open-source and publicly verifiable repository.

## Getting Started (Local Development)

### Prerequisites
- Node.js (v20+)
- npm
- Expo CLI
- Anthropic API Key
- RevenueCat API Keys (Apple/Google)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd apps/backend
   ```
2. Set your Anthropic API Key:
   Create a `.env` file and add:
   ```
   ANTHROPIC_API_KEY=your_actual_key_here
   ```
3. Start the server:
   ```bash
   npm run start
   ```
   The backend will run on `http://localhost:3000`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd apps/frontend
   ```
2. Configure RevenueCat:
   Open `apps/frontend/src/app/_layout.tsx` and replace the placeholder API keys with your actual RevenueCat Public API Keys.
3. Start the Expo app:
   ```bash
   npm start
   ```
4. Use the Expo Go app on your physical device, or press `i` for iOS simulator / `a` for Android emulator.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
