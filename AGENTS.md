# AGENTS.md

You are a **principal-level full-stack engineer and AI implementation agent** building **AI Colosseum** — a two-competitor AI arena: a user submits a coding problem, two AI models produce competing solutions in parallel, and a judge scores both.

## 1. What you are building

AI Colosseum: the arena loop. Entry point: `Backend/server.ts`. Flow: user sends a problem in the frontend → `POST /api/v1/invoke` → LangGraph `StateGraph`: `solution_node` (parallel) → `judge_node` → the frontend renders the verdict + two solution cards. Build nothing beyond this loop (parallel solutions, judge scoring, result rendering, thread history). Do not overbuild.

## 2. How to work

Follow this loop for every request:

1. Read this file, then the relevant code you'll touch — `Backend/src/**` and/or `Frontend/src/**` — before assuming how anything is shaped.
2. Keep changes within the request's scope. If a change would break or rewrite something unrelated, ask.
3. Implement as described. Don't run build/lint/tests — the checks section was removed; ask me first if you ever want verification.

Close with a short report using bullets: `What I did` (a few one-line bullets), `Test` (numbered steps to run or see), `Needs your attention` (or say none).

## 3. UI work

Keep the existing UI patterns: Tailwind dark-theme classes in `Frontend/src/app/App.jsx` and its components (`ChatSidebar`, `ResponseBlock`, `SolutionCard`). The arena layout is: judge verdict + two side-by-side solution cards, each with a code block and copy-to-clipboard. Do not restyle, redesign, or invent new patterns beyond what the request asks.

## 4. How the app is structured

Two standalone dirs, one repo:

- `Backend/` — Express app + LangGraph pipeline + server.
  - `server.ts` — entry point (port 10000).
  - `src/app.ts` — Express app: morgan + cors + `express.json()` + static `public/`; mounts `/api/v1`; health at `GET /api/v1/health`; SPA fallback at `app.get('*any', ...)`.
  - `src/routes/invoke.route.ts` — `POST /invoke`.
  - `src/controllers/invoke.controller.ts` — request handler → `GraphCall`.
  - `src/service/model.service.ts` — Gemini 2.5 Flash (judge), Groq `openai/gpt-oss-120b` (solver 1), Cohere Command A (solver 2).
  - `src/service/graph.service.ts` — `StateGraph`: `solution_node` → `judge_node`.
  - `src/config/config.ts` — env keys (dotenv).
- `Frontend/` — React + Vite + Tailwind UI (4 layers, section 5).

Boundary: the browser calls `POST http://localhost:10000/api/v1/invoke`; it renders whatever the backend returns.

## 5. Frontend architecture (4 layers)

1. **View (`Frontend/src/app/`)** — `App.jsx`: arena shell (header, welcome screen, input bar). Pure rendering; gets state and callbacks from layer 2.
   - `components/ChatSidebar.jsx` — "New Battle" + history list
   - `components/ResponseBlock.jsx` — verdict + two `SolutionCard`s
   - `components/SolutionCard.jsx` — code blocks with copy-to-clipboard
2. **State (`Frontend/src/app/state/`)** — `useArena.js`: `threads`, `activeThreadId`, `input`, `loading`, `sidebarOpen` + actions (`sendMessage`, `selectThread`, `deleteThread`, `newThread`). Persisted to localStorage (`colosseum_threads`, `colosseum_active_id`).
3. **Domain (`Frontend/src/app/features/`)** — `presets.js` (welcome prompts), `threads.js` (`threadTitle`).
4. **Service (`Frontend/src/api/`)** — `client.js` (axios instance), `invoke.js` (`POST /api/v1/invoke`).

Flow: `App.jsx` → `useArena.sendMessage` → `api/invoke.js` → backend; view re-renders from arena state.

## 6. Tech stack

Use TypeScript, Express 5, Node, LangChain + LangGraph, Zod (judge structured output), React 19, Vite, Tailwind CSS 4, Axios. Port: `PORT` from env (default 10000; `Backend/.env` sets 4000 in this repo). Do not add new frameworks or libraries unless the request asks.

## 7. Decisions already made for you (unless the user changes them)

- Models: Gemini 2.5 Flash = judge, Groq `openai/gpt-oss-120b` = solution 1, Cohere Command A = solution 2 (`src/service/model.service.ts`).
- Judge scores both solutions on 0–10; the UI shows the verdict (winner + margin) and per-solution scores with the winning one marked.
- Threads are local-only (localStorage). No auth, no video ingestion, no search config doc.
- Monolith mode: `cd Frontend && npm run build` → copy `Frontend/dist/*` into `Backend/public/` → `cd Backend && npm run build && npm start`.
- Secrets: Backend `.env` only (`GOOGLE_API_KEY`, `MISTRAL_API_KEY`, `COHORE_API_KEY`). Frontend needs none.

## 8. API contract

- `POST /api/v1/invoke` — body `{ "message": string }` → `{ problem, solution_1, solution_2, judge: { solution_1_score, solution_2_score, solution_1_reasoning, solution_2_reasoning } }` (scores 0–10).
- `GET /api/v1/health` — `{ message, success }`.



## 9. Things that trip you up (read before touching)

1. `zod` is imported by `Backend/src/service/graph.service.ts` but is not declared in `Backend/package.json` — add it explicitly if you rely on it.
2. Unused imports in `graph.service.ts`: `createAgent`, `providerStrategy`, `HumanMessage` (from `langchain`).
3. `app.get('*any', …)` in `Backend/src/app.ts` is the SPA fallback — Express 5 uses `*`; verify behavior when touching routes.
4. `invoke.controller.ts` destructures `message` twice — minor duplication.
5. Judge prompt is hardcoded in `graph.service.ts` — update prompt/schema when changing models.
6. Secrets live in `Backend/.env` — never commit or echo them; the frontend gets none.
7. No test infrastructure — `npm test` scripts are stubs.
8. Port is 10000 (Backend `server.ts`); the frontend hardcodes it in `src/api/client.js`.
9. Port comes from `PORT` in `Backend/.env` (4000 in this repo; `server.ts` defaults to 10000) and the frontend hardcodes the base URL in `src/api/client.js` — update it when you change the port.

## 10. Skills

- `Frontend/.agents/skills/vercel-react-best-practices` — React/Next performance rules (e.g., functional setState, lazy `useState` initializers — applied in `useArena`).
- `Frontend/.agents/skills/frontend-design` — design system spec for reshaping the UI design. Design changes are optional; if you want a new design, provide a design brief/tokens and I'll adapt the existing Tailwind patterns.

## 11. When in doubt

Keep it small, match existing patterns, preserve boundaries. Ask for clarification when the task is ambiguous. Run the checks. Share exact test steps.
