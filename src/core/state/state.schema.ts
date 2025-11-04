import { Type } from "@sinclair/typebox/type";

export const i18nValue = Type.Recursive((This) =>
	Type.Union([
		Type.String(),
		Type.Record(Type.String(), This),
		Type.Array(This),
	]),
);

export const i18nResource = Type.Record(Type.String(), i18nValue);

export const TranslationSchema = Type.Object({
	value: Type.String(),
	path: Type.Array(Type.Union([Type.Number(), Type.String()])),
});
