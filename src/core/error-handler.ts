import { isDebug, logger } from "../shared/logger";

import {
	ConfigError,
	DatabaseError,
	FrameworkError,
	SourceError,
} from "./errors";

export function handleCliError(err: unknown): never {
	const data = isDebug ? err : "";

	if (err instanceof ConfigError) {
		logger.error(`[Config Error]\n${err.message}\n`, data);
	} else if (err instanceof FrameworkError) {
		logger.error(`[Framework Error]\n${err.message}\n`, data);
	} else if (err instanceof DatabaseError) {
		logger.error(`[Database Error]\n${err.message}\n`, data);
	} else if (err instanceof SourceError) {
		logger.error(`[Source Error]\n${err.message}\n`, data);
	} else if (err instanceof Error) {
		logger.error(`[Error]\n${err.message}\n`, data);
	} else {
		logger.error(`[Unknown Error]`, err);
	}

	process.exit(1);
}
