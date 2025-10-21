import { Type } from "@sinclair/typebox";

export const i18nValue = Type.Recursive((This) =>
	Type.Union([
		Type.String(),
		Type.Record(Type.String(), This),
		Type.Array(This),
	]),
);

export const i18nResource = Type.Record(Type.String(), i18nValue);
