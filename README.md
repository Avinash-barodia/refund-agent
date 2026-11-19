# AI Customer Support Agent (Refunds)

![Refund Agent Demo](https://github.com/AmanSingh262/ai-refund-agent/blob/ca1f8dadfdbd703a0f460334d948c5e84399a98e/Screenshot%202026-06-01%20213353.png)

A fully containerized AI Customer Support Agent built to strictly enforce e-commerce refund policies while actively defending against prompt injections. 

## 🚀 Quickstart

1. **Configure API Key:**
   Open the `.env` file at the root of the project and insert your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

2. **Run the Application:**
   Start the entire stack (FastAPI Backend + Next.js Frontend + SQLite) with a single command:
   ```bash
   docker-compose up --build
   ```

3. **Access the App:**
   - Frontend UI: [http://localhost:3001](http://localhost:3001)
   - Backend API: [http://localhost:8000](http://localhost:8000)

## 🏗️ Architectural Overview

The application is split into two distinct, loosely-coupled services to maintain a **strict separation of concerns**:

### 1. The Frontend (Next.js, Tailwind CSS)
Handles purely presentation logic and state management.
- **Left Panel**: A sleek, dark-mode chat interface where customers provide their email/order ID and converse with the agent.
- **Right Panel**: A real-time Admin Dashboard that intercepts and displays the agent's internal reasoning, tool calls, and decision-making process.

### 2. The Backend (FastAPI, SQLite, OpenAI)
The brain of the operation. It manages state transitions, orchestrates the LLM agent, and interacts with the CRM database.
- **Agent Loop**: We use a robust function-calling loop. When a user sends a message, the LLM processes it against its `SYSTEM_PROMPT`. It can independently invoke backend tools (e.g., `lookup_order`, `read_policy`, `process_refund`, `escalate_to_human`). The backend executes these tools and feeds the exact results back into the LLM until a final response is generated.
- **Database**: A synthetic SQLite database (`crm.db`) is auto-generated with mock customers and specific order scenarios (e.g., final sale items, items over $500, old purchases).

## 🛡️ Resilience & Prompt Injection Defense

The system is designed to be highly resilient against user manipulation:
1. **Strict Tool Validation**: The agent cannot process a refund via pure text. It *must* invoke the `process_refund` backend function. The function itself double-checks the policy (e.g., `amount > 500` or `is_final_sale == True`) and will outright reject the tool call if the rules are violated, returning a hard error to the agent.
2. **System Prompt Engineering**: The agent is heavily constrained by the `SYSTEM_PROMPT`. It explicitly commands the agent to ignore any user requests to "ignore previous instructions" or override policy limits.
3. **Escalation Protocol**: High-value items (>$500) trigger a mandatory `escalate_to_human` tool call. The LLM is structurally forbidden from issuing a refund for these items, acting as an immutable safeguard.

---
*Built as a resilient, enterprise-grade demonstration of agentic AI.*
