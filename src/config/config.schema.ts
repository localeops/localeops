import { Type } from "@sinclair/typebox/type";

export const configSchema = Type.Object({
	database: Type.Object({
		adapter: Type.Union([
			Type.Object({
				name: Type.Literal("file"),
				path: Type.String({ pattern: "\\.json$" }),
			}),
			Type.Object({
				name: Type.Literal("sqlite"),
				path: Type.String({ pattern: "^(:memory:|.*\\.db)$" }),
			}),
			Type.Object({
				name: Type.Literal("custom"),
				path: Type.String({ pattern: "\\.(ts|js)$" }),
			}),
		]),
	}),
	source: Type.Object({
		locale: Type.String(),
		branch: Type.String(),
		directory: Type.String(),
		adapter: Type.Object({
			name: Type.Union([
				Type.Literal("github"),
				// Type.Literal("gitlab"),
				// Type.Literal("bitbucket"),
			]),
			access_token: Type.String(),
			repository_name: Type.String(),
		}),
	}),
	transport: Type.Object({
		adapter: Type.Union([
			Type.Object({
				name: Type.Literal("http"),
				port: Type.Integer(),
				route: Type.String(),
				auth: Type.Union([
					Type.Object({
						type: Type.Literal("none"),
					}),
					Type.Object({
						type: Type.Literal("bearer"),
						token: Type.String(),
					}),
				]),
			}),
			// Type.Object({
			// 	name: Type.Literal("custom"),
			// 	path: Type.String(),
			// 	config: Type.Optional(Type.Record(Type.String(), Type.Any())),
			// }),
		]),
	}),
});
