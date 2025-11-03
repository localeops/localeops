import { Type } from "@sinclair/typebox";
import { TranslationSchema } from "../../../core/state/state.schema";

export const PostTranslationSchema = Type.Intersect([
	TranslationSchema,
	Type.Object({
		from: Type.String(),
	}),
]);

export const PostTranslationsDto = Type.Object({
	locale: Type.String(),
	translations: Type.Array(PostTranslationSchema),
});
