// Netlify Function entry point. All logic lives in /server so it can be tested without Netlify.
import { handle } from "../../server/router.mjs";

export const config = { path: "/api/*" };
export default handle;
