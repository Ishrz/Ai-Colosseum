// Vercel serverless entrypoint.
// Every request handed to this function is passed straight to the Express app,
// so the existing routes (/api/v1/invoke, /api/v1/health) keep working.
// `npm run build` (tsc) outputs this path: Backend/dist/src/app.js
import app from "../dist/src/app.js";

export default app;
 