Bun.serve({
	port: 3002,
	routes: {
		"/api/status": new Response("OK"),
	},
	development: process.env.NODE_ENV !== "production",
});
