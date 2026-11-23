# AI Colosseum

**Two AI models compete. A third judges. You bring the problem.**

AI Colosseum is a full-stack AI arena. You submit a coding problem, two LLMs generate competing solutions in parallel, and a judge model scores both from 0–10 with written reasoning. The UI renders the verdict and the two solutions side by side, with code blocks you can copy. Battles are saved in the browser, so there is no auth, database, or server-side history.

---


## Features

- **Parallel solutions** — Groq and Cohere answer the same problem at the same time.
- **Structured judging** — Gemini returns validated scores and reasoning via Zod structured output.
- **Arena UI** — judge verdict banner, winner badge, score gauges, and side-by-side solution cards.
- **Copyable code** — fenced code blocks in each solution render with a copy button.
- **Local battle history** — threads persist in `localStorage`; select, revisit, or delete them from the sidebar.
- **Light / dark theme** — persisted per browser, applied before first paint.
- **Single-process mode** — Express serves both the API and the built frontend.
- **Vercel-ready** — static frontend + one serverless function, configured in `Backend/vercel.json`.

---

## How it works

```text
Browser (React + Vite)
        │
        │  POST /api/v1/invoke  { "message": "..." }
        ▼
Express app (Backend)
        │
        ▼
LangGraph StateGraph
        │
        ├── solution_node ──► Groq  openai/gpt-oss-120b ┐
        │                 └─► Cohere command-a-03-2025  ┘  (Promise.all)
        │
        └── judge_node ─────► Gemini 2.5 Flash
                              (Zod structured output, 0–10)
        │
        ▼
{ problem, solution_1, solution_2, judge }
        │
        ▼
UI: verdict + two solution cards
```

The graph is defined in `Backend/src/service/graph.service.ts`:

```text
START → solution_node → judge_node → END
```

`solution_node` calls both solver models in parallel. `judge_node` asks Gemini for a JSON-shaped evaluation using `withStructuredOutput`.

---

## Tech stack

| Layer | Technologies |
| --- | --- |
| Backend | Node.js, TypeScript, Express 5, LangChain, LangGraph, Zod, morgan, cors, dotenv |
| Frontend | React 19, Vite 8, Tailwind CSS 4, Axios |
| AI models | Gemini 2.5 Flash (judge), Groq `openai/gpt-oss-120b` (solution 1), Cohere `command-a-03-2025` (solution 2) |
| Deployment | Vercel (static `public/` + serverless `api/`), or a single Node process |

---

## Project structure

```text
.
├── Backend/
│   ├── server.ts                  # entry point, reads PORT (default 5000)
│   ├── api/
│   │   └── index.js               # Vercel serverless entry (imports dist/src/app.js)
│   ├── vercel.json                # Vercel rewrites: /api/* -> function, rest -> index.html
│   ├── public/                    # built frontend served by Express / Vercel
│   ├── tsconfig.json              # tsc -> dist/ (rootDir ".", outDir "./dist")
│   └── src/
│       ├── app.ts                 # Express app, CORS, static files, SPA fallback
│       ├── config/config.ts       # env keys via dotenv
│       ├── routes/invoke.route.ts # POST /invoke
│       ├── controllers/
│       │   └── invoke.controller.ts
│       └── service/
│           ├── model.service.ts   # model clients
│           └── graph.service.ts   # LangGraph pipeline + judge prompt
│
├── Frontend/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── index.css              # Tailwind theme tokens (dark + light)
│       ├── api/
│       │   ├── client.js          # Axios base URL
│       │   └── invoke.js          # POST /api/v1/invoke
│       └── app/
│           ├── App.jsx            # arena shell
│           ├── state/useArena.js  # threads, loading, sendMessage, localStorage
│           ├── features/          # welcome presets, thread titles
│           └── components/        # ChatSidebar, ResponseBlock, SolutionCard, Markdown
│
├── AGENTS.md                      # project conventions for AI coding agents
├── .gitignore
└── README.md
```

---

## Prerequisites

- **Node.js 20.19+ or 22.12+** (Vite 8 requirement)
- **npm**
- API keys:
  - [Google AI Studio](https://aistudio.google.com/) — Gemini judge
  - [Groq](https://console.groq.com/) — solution 1
  - [Cohere](https://dashboard.cohere.com/) — solution 2

---

## Getting started

### 1. Backend

```bash
cd Backend
npm install
```



Start the API:

```bash
npm run dev        # tsx watch ./server.ts
```

Health check: <http://localhost:4000/api/v1/health>

> `server.ts` falls back to port `5000` when `PORT` is unset. The frontend dev setup expects `4000`, so set `PORT=4000` in `Backend/.env`.

### 2. Frontend

In a second terminal:

```bash
cd Frontend
npm install
npm run dev
```

Open <http://localhost:5173>. In development, Axios targets `http://localhost:4000` (see `Frontend/src/api/client.js`). Production builds use same-origin relative URLs.

### 3. Use it

Pick a welcome preset or type a coding problem. The arena shows a loading state while both solutions generate, then renders the verdict and both cards.

---



## API reference

Local base URL: `http://localhost:4000`

### `POST /api/v1/invoke`

Runs the full LangGraph pipeline for one problem.

**Request**

```json
{
  "message": "Write a function to reverse a string in JavaScript"
}
```

**Response — `201 Created`**

```json
{
  "message": "graph executed successfully",
  "success": true,
  "result": {
    "problem": "Write a function to reverse a string in JavaScript",
    "solution_1": "function reverseString(str) { ... }",
    "solution_2": "function reverseString(str) { ... }",
    "judge": {
      "solution_1_score": 9.2,
      "solution_2_score": 7.4,
      "solution_1_reasoning": "Why solution 1 scored what it did.",
      "solution_2_reasoning": "Why solution 2 scored what it did."
    }
  }
}
```

Scores are numbers from `0` to `10`. Solution fields are model output as text; fenced Markdown code blocks are rendered as code in the UI.


**Example**

```bash
curl -X POST http://localhost:4000/api/v1/invoke \
  -H "Content-Type: application/json" \
  -d '{"message":"Write a function to reverse a string in JavaScript"}'
```

### `GET /api/v1/health`

```json
{
  "message": "Server is running...",
  "success": true
}
```

**Other behavior**

- `cors()` is enabled for all origins.
- JSON request bodies are parsed with `express.json()` (default 100 KB limit).
- Unknown non-API paths fall through to `public/index.html` (SPA fallback).

---

## Scripts

### Backend (`cd Backend`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start with `tsx watch ./server.ts` |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server (`node dist/server.js`) |
| `npm test` | Placeholder; no test suite is configured |

### Frontend (`cd Frontend`)

| Command | Description |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |

---


## Known limitations

- **No tests** — `npm test` is a stub in both packages.
- **No auth or database** — history is local to each browser.
- **`zod` is imported but not declared** in `Backend/package.json`; it currently resolves transitively through LangChain. Declare it explicitly if you rely on it.
- **Unused imports/config** — `createAgent`, `providerStrategy`, and `HumanMessage` are imported in `graph.service.ts` but unused; `MISTRAL_API_KEY` and the Mistral client are present but the model is commented out.
- **Error status** — pipeline failures return HTTP `200` with an `error` field; see [API reference](#api-reference).
- **No streaming** — the client waits for the full graph result before rendering.

---

## License

No license file is included in this repository. Add a license before redistributing or accepting external contributions.
