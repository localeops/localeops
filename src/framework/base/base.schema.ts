import { Type } from "@sinclair/typebox/type";

export const UpdateSchema = Type.Object({
	value: Type.String(),
	filePath: Type.String(),
	resourcePath: Type.Array(Type.Union([Type.Number(), Type.String()])),
});

export const SnapshotSchema = Type.Record(Type.String(), Type.Unknown());
