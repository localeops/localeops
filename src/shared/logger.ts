export const isDebug = process.env.DEBUG === "true";

export const logger = {
	debug: (message: string, data?: unknown) => {
		if (isDebug) {
			console.error(`[DEBUG] ${message}`, data ?? "");
		}
	},
	error: (message: string, data?: unknown) => {
		console.error(message, data ?? "");
	},
};
