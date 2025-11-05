import fs from "node:fs";
import path from "node:path";
import { Type } from "@sinclair/typebox/type";
import { Value } from "@sinclair/typebox/value";
import { YAML } from "bun";

const isProd = process.env.NODE_ENV === "production";
const configFileName = `localeops${isProd ? "" : ".dev"}.yml`;
const dirPath = isProd ? process.execPath : "";
const configFilePath = path.join(path.dirname(dirPath), configFileName);

let fileConfig: unknown;

if (fs.existsSync(configFilePath)) {
	const text = fs.readFileSync(configFilePath, "utf8");
	fileConfig = YAML.parse(text);
}

if (!fileConfig) {
	console.error(`${configFileName} not found`);
	process.exit(1);
}

const configSchema = Type.Object({
	server: Type.Object({
		port: Type.Integer(),
	}),
	source: Type.Object({
		locale: Type.String(),
		branch: Type.String(),
		directory: Type.String(),
		adapter: Type.Object({
			name: Type.Union([Type.Literal("github")]),
			repository_name: Type.String(),
			access_token: Type.String(),
		}),
	}),
});

const converted = Value.Convert(configSchema, fileConfig);

if (!Value.Check(configSchema, converted)) {
	const errors = Value.Errors(configSchema, converted);
	console.error("Invalid environment variables:", ...errors);
	process.exit(1);
}

export const config = Value.Parse(configSchema, converted);
