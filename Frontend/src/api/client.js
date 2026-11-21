import axios from "axios";

// Local dev talks to the backend port; the production build uses same-origin
// relative URLs so the Vercel deployment serves UI and API from one domain.
const baseURL = import.meta.env.DEV ? "http://localhost:4000" : "";

const client = axios.create({ baseURL });

export default client;
