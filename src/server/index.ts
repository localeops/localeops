import translationRoutes from "./modules/translation/translation.routes";

Bun.serve({
	port: 3002,
	routes: { "/api/translations": translationRoutes },
	development: process.env.NODE_ENV !== "production",
});
