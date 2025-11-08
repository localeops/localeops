import fs from "node:fs";
import path from "node:path";
import type { Static } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { YAML } from "bun";
import { configSchema } from "./config.schema";
import { interpolateEnvVars } from "./config.utils";

const isProduction = process.env.NODE_ENV === "production";
// prod: next to the binary; dev: project root
const baseDir = isProduction ? path.dirname(process.execPath) : process.cwd();

const configFileName = "localeops.yml";
const configFilePath = path.join(baseDir, configFileName);

if (!fs.existsSync(configFilePath)) {
	console.error(`${configFileName} not found at ${configFilePath}`);
	process.exit(1);
}

let configFile: unknown;
try {
	let configContent = fs.readFileSync(configFilePath, "utf8");
	configContent = interpolateEnvVars(configContent);
	configFile = YAML.parse(configContent);
} catch (error) {
	console.error(error instanceof Error ? error.message : String(error));
	process.exit(1);
}

if (!Value.Check(configSchema, configFile)) {
	const errors = [...Value.Errors(configSchema, configFile)];
	console.error("Invalid config structure:");
	for (const error of errors) {
		console.error(`  - ${error.path}: ${error.message}`);
	}
	process.exit(1);
}

export const config = Value.Parse(configSchema, configFile);
export type Config = Static<typeof configSchema>;
export { baseDir };
