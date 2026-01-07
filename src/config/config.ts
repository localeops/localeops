import fs from "node:fs";
import type { Static, TSchema } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { YAML } from "bun";
import { ConfigError } from "../core/errors";
import { type BaseDatabase, createDatabase } from "../databases";
import type { BaseFramework } from "../framework/base/base.framework";
import { createFramework } from "../framework/factory";
import { logger } from "../shared/logger";
import { resolveConfigPath } from "../shared/paths";
import { type BaseSource, createSource } from "../sources";
import {
	configSchema,
	databaseSchema,
	frameworkSchema,
	sourceSchema,
	targetLocalesSchema,
} from "./config.schema";
import { interpolateEnvVars } from "./config.utils";

const configFileName = "localeops.yml";

const configFilePath = resolveConfigPath(configFileName);

let configFile: Config = {};

function loadConfig() {
	if (!fs.existsSync(configFilePath)) {
		throw new ConfigError(
			`LocaleOps configuration file not found at "${configFilePath}".\nCreate ${configFileName} at the root of your project.`,
		);
	}

	const configContent = fs.readFileSync(configFilePath, "utf8");

	try {
		let config = YAML.parse(configContent);

		config = Value.Default(configSchema, config);

		if (typeof config !== "object" || config === null) {
			throw new ConfigError("Config file must contain a valid YAML object.");
		}

		configFile = config;
	} catch (error) {
		throw new ConfigError(
			`Config file contains invalid YAML syntax.\nEnsure the file is correctly formatted YAML.`,
			{ cause: error },
		);
	}
}

loadConfig();

function validateConfig<T extends TSchema>({
	schema,
	section,
	sectionName,
}: {
	schema: T;
	section: unknown;
	sectionName: string;
}): Static<T> {
	if (!Value.Check(schema, section)) {
		const errors = [...Value.Errors(schema, section)];

		const errorsMessage = errors
			.map((e) => `- ${e.path}: ${e.message}`)
			.join("\n");

		throw new ConfigError(
			`Invalid config for ${sectionName}:\n${errorsMessage}`,
		);
	}

	return Value.Parse(schema, section);
}

export function initTargetLocales(): string[] {
	const section = configFile?.targetLocales;

	if (!section) {
		throw new ConfigError(
			"targetLocales configuration is missing in config file.",
		);
	}

	const interpolatedSection = interpolateEnvVars(JSON.stringify(section));

	const config = validateConfig({
		schema: targetLocalesSchema,
		section: JSON.parse(interpolatedSection),
		sectionName: "targetLocales",
	});

	logger.debug("Target locales:", config);

	return config;
}

export function initFramework(): BaseFramework<unknown> {
	const section = configFile?.framework;

	if (!section) {
		throw new ConfigError("Framework configuration is missing in config file.");
	}

	const interpolatedSection = interpolateEnvVars(JSON.stringify(section));

	const config = validateConfig({
		schema: frameworkSchema,
		section: JSON.parse(interpolatedSection),
		sectionName: "framework",
	});

	logger.debug("Framework config:", config);

	return createFramework(config);
}

export function initSource(): BaseSource {
	const section = configFile?.source;

	if (!section) {
		throw new ConfigError("Source configuration is missing in config file.");
	}

	const interpolatedSection = interpolateEnvVars(JSON.stringify(section));

	const config = validateConfig({
		schema: sourceSchema,
		section: JSON.parse(interpolatedSection),
		sectionName: "source",
	});

	logger.debug("Source config:", config);

	return createSource(config);
}

export async function initDatabase(): Promise<BaseDatabase> {
	const section = configFile?.database;

	if (!section) {
		throw new ConfigError("Database configuration is missing in config file.");
	}

	const interpolatedSection = interpolateEnvVars(JSON.stringify(section));

	const config = validateConfig({
		schema: databaseSchema,
		section: JSON.parse(interpolatedSection),
		sectionName: "database",
	});

	logger.debug("Database config:", config);

	const database = await createDatabase(config);

	await database.initialize();

	return database;
}

export type Config = Static<typeof configSchema>;

export type FrameworkConfig = Static<typeof frameworkSchema>;

export type SourceConfig = Static<typeof sourceSchema>;

export type DatabaseConfig = Static<typeof databaseSchema>;
