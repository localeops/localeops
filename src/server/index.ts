import { config } from "../config";
import { initDatabase } from "./database/database";
import translationRoutes from "./modules/translation/translation.routes";

await initDatabase();

Bun.serve({
	port: config.server.port,
	routes: { "/api/translations": translationRoutes },
	development: process.env.NODE_ENV !== "production",
});

console.log(`Server is running on port ${config.server.port}`);
