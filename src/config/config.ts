import fs from "node:fs";
import type { Static } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { YAML } from "bun";
import { logger } from "../shared/logger";
import { resolveConfigPath } from "../shared/paths";
import { configSchema } from "./config.schema";
import { interpolateEnvVars } from "./config.utils";

const configFileName = "localeops.yml";

const configFilePath = resolveConfigPath(configFileName);

if (!fs.existsSync(configFilePath)) {
	logger.error(`${configFileName} not found at ${configFilePath}`);

	process.exit(1);
}

let configFile: unknown;
try {
	let configContent = fs.readFileSync(configFilePath, "utf8");
	configContent = interpolateEnvVars(configContent);
	configFile = YAML.parse(configContent);
} catch (err) {
	logger.error(err instanceof Error ? err.message : "Unknown", err);

	process.exit(1);
}

if (!Value.Check(configSchema, configFile)) {
	const errors = [...Value.Errors(configSchema, configFile)];
	logger.error("Invalid config structure:");
	for (const error of errors) {
		logger.error(`  - ${error.path}: ${error.message}`);
	}
	process.exit(1);
}

export const config = Value.Parse(configSchema, configFile);
export type Config = Static<typeof configSchema>;
