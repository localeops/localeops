import { Type } from "@sinclair/typebox/type";

export const frameworkSchema = Type.Object({
	sourceLocale: Type.String(),
	directory: Type.String(),
	name: Type.Union([Type.Literal("i18next"), Type.Literal("formatjs")]),
});

export const databaseSchema = Type.Object({
	adapter: Type.Union([
		Type.Object({
			name: Type.Literal("file"),
			dirPath: Type.String({ default: ".localeops/snapshots" }),
		}),
		Type.Object({
			name: Type.Literal("custom"),
			path: Type.String({ pattern: "\\.(ts|js)$" }),
		}),
	]),
});

export const sourceSchema = Type.Union([
	Type.Object({
		name: Type.Literal("github"),
		base: Type.String(),
		repo: Type.String({ pattern: "^[^/]+/[^/]+$" }),
		token: Type.String(),
		apiUrl: Type.String({ default: "https://api.github.com" }),
	}),
	Type.Object({
		name: Type.Literal("bitbucket"),
		base: Type.String(),
		repo: Type.String({ pattern: "^[^/]+/[^/]+$" }),
		token: Type.String(),
	}),
	Type.Object({
		name: Type.Literal("gitlab"),
		base: Type.String(),
		repo: Type.String({ pattern: "^[^/]+/[^/]+$" }),
		token: Type.String(),
	}),
]);

export const targetLocalesSchema = Type.Array(Type.String());

export const configSchema = Type.Object({
	framework: Type.Optional(frameworkSchema),
	database: Type.Optional(databaseSchema),
	source: Type.Optional(sourceSchema),
	targetLocales: Type.Optional(targetLocalesSchema),
});
