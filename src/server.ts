Bun.serve({
	port: 3002,
	// `routes` requires Bun v1.2.3+
	routes: {
		"/api/status": new Response("OK"),
	},

	// (optional) fallback for unmatched routes:
	// Required if Bun's version < 1.2.3
	fetch() {
		return new Response("Not Found", { status: 404 });
	},
	development: process.env.NODE_ENV !== "production",
});
