import { Type } from "@sinclair/typebox/type";

const I18nextResourceValueSchema = Type.Recursive((This) =>
	Type.Union([
		Type.String(),
		Type.Record(Type.String(), This),
		Type.Array(This),
	]),
);

export const I18nextResourceSchema = Type.Record(
	Type.String(),
	I18nextResourceValueSchema,
);
