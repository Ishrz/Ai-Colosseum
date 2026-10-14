# AI Colosseum

An AI-powered battle arena where two competing AI solutions face off, and a judge determines the winner.

## How It Works

1. **Submit** a coding problem
2. **Generate** — two AI models (Mistral and Cohere) produce solutions in parallel
3. **Judge** — Google Gemini 2.5 Flash scores and critiques both solutions (0–10)
4. **Compare** — view side-by-side results with a recommendation

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | TypeScript, Express 5, Node.js |
| AI Orchestration | LangChain + LangGraph |
| AI Models | Gemini 2.5 Flash (judge), Mistral Small (solver 1), Cohere Command A (solver 2) |
| Frontend | React 19, Vite, Tailwind CSS 4 |
| Validation | Zod (structured output) |

## Project Structure

```
Ai_Colosseum/
├── Backend/
│   ├── src/
│   │   ├── server.ts              # Entry point
│   │   ├── app.ts                 # Express app setup
│   │   ├── config/config.ts       # Env loader
│   │   ├── controllers/           # Request handlers
│   │   ├── routes/                # API routes
│   │   └── service/
│   │       ├── model.service.ts   # AI model instances
│   │       └── graph.service.ts   # LangGraph workflow
│   └── public/                    # Built frontend (monolith mode)
├── Frontend/
│   └── src/
│       ├── main.jsx               # React entry
│       └── app/
│           ├── App.jsx            # Chat interface
│           └── components/        # UI components
└── README.md
```

## Getting Started

### Prerequisites

- Node.js
- API keys for [Google AI](https://aistudio.google.com), [Mistral AI](https://console.mistral.ai), and [Cohere](https://dashboard.cohere.com)



### Monolith Mode (production)

```bash
cd Frontend && npm run build
# Copy Frontend/dist/ contents into Backend/public/
cd ../Backend && npm run build && npm start
```



## API

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/v1/invoke` | Submit a problem, get dual solutions + judge evaluation |
| `GET` | `/api/v1/health` | Health check |

### Request/Response Example

**Request:**
```json
{ "message": "Implement a binary search in Python" }
```

**Response:**
```json
{
  "problem": "...",
  "solution_1": "...",
  "solution_2": "...",
  "judge": {
    "solution_1_score": 8,
    "solution_2_score": 7,
    "solution_1_reasoning": "...",
    "solution_2_reasoning": "..."
  }
}
```

## Scripts

| Command | Location | Purpose |
|---|---|---|
| `npm run dev` | Backend | Start with hot-reload |
| `npm run build` | Backend | Compile TypeScript |
| `npm start` | Backend | Run compiled server |
| `npm run dev` | Frontend | Start Vite dev server |
| `npm run build` | Frontend | Production build |
| `npm run preview` | Frontend | Preview production build |

## Architecture

- **LangGraph StateGraph** orchestrates the pipeline: `solution_node` (parallel generation) → `judge_node` (evaluation)
- **Zod structured output** ensures the judge returns typed, predictable JSON
- **Parallel solution generation** via `Promise.all` minimizes latency
- **SPA + API monolith** — Express serves both the built frontend and the API from a single port
