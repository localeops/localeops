import type { Static } from "@sinclair/typebox";
import type { UpdateSchema } from "./base.schema";

export type Path = Array<string | number>;

export type SnapshotDelta = ResourceDelta & {
	filePath: string;
};

type ResourceBaseDelta = {
	resourcePath: Path;
};

type ResourceAddedDelta = ResourceBaseDelta & {
	type: "added";
	value: string;
};

type ResourceChangedDelta = ResourceBaseDelta & {
	type: "changed";
	oldValue: string;
	newValue: string;
};

type ResourceRemovedDelta = ResourceBaseDelta & {
	type: "removed";
};

export type ResourceDelta =
	| ResourceAddedDelta
	| ResourceRemovedDelta
	| ResourceChangedDelta;

export type Update = Static<typeof UpdateSchema>;

export type Snapshot<Resource> = Record<string, Resource>;
