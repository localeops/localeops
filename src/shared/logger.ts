const isDebug = process.env.DEBUG === "true";

export const logger = {
	debug: (message: string, data?: unknown) => {
		if (isDebug) {
			console.log(`[DEBUG] ${message}`, data ?? "");
		}
	},
	info: (message: string, data?: unknown) => {
		console.log(`[INFO] ${message}`, data ?? "");
	},
	error: (message: string, data?: unknown) => {
		console.error(`[ERROR] ${message}`, data ?? "");
	},
};
