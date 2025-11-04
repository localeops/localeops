import { Type } from "@sinclair/typebox/type";
import { Value } from "@sinclair/typebox/value";

const envSchema = Type.Object({
	PORT: Type.Integer(),
	SOURCE_LOCALE: Type.String(),
	SOURCE_BRANCH: Type.String(),
	SOURCE_DIRECTORY: Type.String(),
	SOURCE_FILE: Type.String(),
	GITHUB_REPO: Type.String(),
	GITHUB_OWNER: Type.String(),
	GITHUB_TOKEN: Type.String(),
});

const converted = Value.Convert(envSchema, process.env);

if (!Value.Check(envSchema, converted)) {
	const errors = Value.Errors(envSchema, converted);
	console.error("Invalid environment variables", ...errors);
	process.exit(1);
}

const config = Value.Parse(envSchema, converted);

export default config;
