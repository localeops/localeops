import type { Static } from "@sinclair/typebox";
import { Type } from "@sinclair/typebox";
import { ResourcePathSchema } from "../framework/base/base.schema";

export const TranslationSchema = Type.Object({
	value: Type.String(),
	from: Type.String(),
	filePath: Type.String(),
	resourcePath: ResourcePathSchema,
});

export type Translation = Static<typeof TranslationSchema>;
