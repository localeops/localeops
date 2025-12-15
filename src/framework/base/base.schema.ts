import { Type } from "@sinclair/typebox/type";

export const PathSchema = Type.Array(
	Type.Union([Type.Number(), Type.String()]),
);

export const ResourceUpdateSchema = Type.Object({
	value: Type.String(),
	resourcePath: PathSchema,
});

export const SnapshotSchema = Type.Record(Type.String(), Type.Unknown());
