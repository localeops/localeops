import { Type } from "@sinclair/typebox/type";

export const configSchema = Type.Object({
	framework: Type.Object({
		locale: Type.String(),
		directory: Type.String(),
		name: Type.Union([Type.Literal("i18next"), Type.Literal("formatjs")]),
	}),
	database: Type.Object({
		adapter: Type.Union([
			Type.Object({
				name: Type.Literal("file"),
			}),
			Type.Object({
				name: Type.Literal("custom"),
				path: Type.String({ pattern: "\\.(ts|js)$" }),
			}),
		]),
	}),
	source: Type.Union([
		Type.Object({
			name: Type.Literal("github"),
			base: Type.String(),
			repo: Type.String({ pattern: ".+/.+" }),
			token: Type.String(),
			apiUrl: Type.Optional(Type.String({ default: "https://api.github.com" })),
		}),
	]),
	locales: Type.Array(Type.String()),
});
