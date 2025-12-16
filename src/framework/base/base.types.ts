import type { Static } from "@sinclair/typebox";
import type { ResourcePathSchema, ResourceUpdateSchema } from "./base.schema";

export type ResourcePath = Static<typeof ResourcePathSchema>;

type ResourceBaseDelta = {
	resourcePath: ResourcePath;
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
	| ResourceChangedDelta
	| ResourceRemovedDelta;

export type SnapshotDelta = ResourceDelta & {
	filePath: string;
};

export type ResourceUpdate = Static<typeof ResourceUpdateSchema>;

export type Snapshot<Resource> = Record<string, Resource>;
