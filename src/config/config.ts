import fs from "node:fs";
import type { Static } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { YAML } from "bun";
import { handleCliError } from "../core/error-handler";
import { ConfigError } from "../core/errors";
import { resolveConfigPath } from "../shared/paths";
import { configSchema } from "./config.schema";
import { interpolateEnvVars } from "./config.utils";

const configFileName = "localeops.yml";

const configFilePath = resolveConfigPath(configFileName);

let configFile: unknown;
try {
	if (!fs.existsSync(configFilePath)) {
		throw new ConfigError(
			`LocaleOps configuration file not found at "${configFilePath}".\nCreate ${configFileName} at the root of your project.`,
		);
	}

	const configContent = fs.readFileSync(configFilePath, "utf8");

	const interpolatedConfigContent = interpolateEnvVars(configContent);

	try {
		configFile = YAML.parse(interpolatedConfigContent);

		configFile = Value.Default(configSchema, configFile);
	} catch (error) {
		throw new ConfigError(
			`Config file contains invalid YAML syntax.\nEnsure the file is correctly formatted YAML.`,
			{ cause: error },
		);
	}

	if (!Value.Check(configSchema, configFile)) {
		const errors = [...Value.Errors(configSchema, configFile)];

		const errorsMessage = errors
			.map((e) => `- ${e.path}: ${e.message}`)
			.join("\n");

		throw new ConfigError(`Invalid config structure:\n${errorsMessage}`);
	}
} catch (error) {
	handleCliError(error);
}

export const config = Value.Parse(configSchema, configFile);
export type Config = Static<typeof configSchema>;
