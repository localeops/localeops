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
				dirPath: Type.String(),
			}),
			Type.Object({
				name: Type.Literal("sqlite"),
				path: Type.String({ pattern: "^(:memory:|.*\\.db)$" }),
			}),
			Type.Object({
				name: Type.Literal("mysql"),
				port: Type.Number(),
				hostname: Type.String(),
				username: Type.String(),
				password: Type.Optional(Type.String()),
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
			apiUrl: Type.String({ default: "https://api.github.com" }),
		}),
		Type.Object({
			name: Type.Literal("bitbucket"),
			base: Type.String(),
			repo: Type.String(),
			token: Type.String(),
			apiUrl: Type.Optional(
				Type.String({ default: "https://api.bitbucket.org/2.0" }),
			),
		}),
	]),
});
