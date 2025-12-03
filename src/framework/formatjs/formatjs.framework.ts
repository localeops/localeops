import fs from "node:fs";
import { Value } from "@sinclair/typebox/value";
import get from "lodash/get";
import set from "lodash/set";
import { logger } from "../../shared/logger";
import { BaseFramework } from "../base/base.framework";
import type {
	Path,
	ResourceDelta,
	Snapshot,
	SnapshotDelta,
	Update,
} from "../base/base.types";
import { FormatjsResourceSchema } from "./formatjs.schema";
import type { FormatjsResource } from "./formatjs.types";

export class FormatjsFramework extends BaseFramework<FormatjsResource> {
	readResourceFile(path: string): {
		resource: FormatjsResource;
		raw: string | null;
	} {
		try {
			const raw = fs.readFileSync(path, { encoding: "utf-8" });
			const resource = Value.Parse(FormatjsResourceSchema, JSON.parse(raw));
			return { resource, raw };
		} catch {
			return { resource: {}, raw: null };
		}
	}

	diffSnapshots({
		oldSnapshot,
		newSnapshot,
	}: {
		oldSnapshot: Snapshot<FormatjsResource>;
		newSnapshot: Snapshot<FormatjsResource>;
	}): SnapshotDelta[] {
		const changes: SnapshotDelta[] = [];

		const oldSnapshotFilePaths = new Set(Object.keys(oldSnapshot));
		const newSnapshotFilePaths = new Set(Object.keys(newSnapshot));

		// Added file path
		for (const filePath of newSnapshotFilePaths) {
			if (!oldSnapshotFilePaths.has(filePath)) {
				if (newSnapshotFilePaths.has(filePath)) {
					const newRes = newSnapshot[filePath];

					if (!newRes) {
						throw new Error(`Invariant: newSnapshot[${filePath}] is missing`);
					}

					const resourceDeltas = this.diffResources({
						oldResource: {},
						newResource: newRes,
						path: [],
					});

					changes.push(...resourceDeltas.map((d) => ({ ...d, filePath })));
				}
			}
		}

		// Removed file path
		for (const filePath of oldSnapshotFilePaths) {
			if (!newSnapshotFilePaths.has(filePath)) {
				if (oldSnapshotFilePaths.has(filePath)) {
					// TODO: return translation file removed delta
					logger.debug(`File ${filePath} was removed`);
				}
			}
		}

		// File path present in both: compare resources
		for (const filePath of newSnapshotFilePaths) {
			if (newSnapshotFilePaths.has(filePath)) {
				if (oldSnapshotFilePaths.has(filePath)) {
					const oldResource = oldSnapshot[filePath];
					const newResource = newSnapshot[filePath];

					if (!oldResource) {
						throw new Error(`Invariant: oldSnapshot[${filePath}] is missing`);
					}

					if (!newResource) {
						throw new Error(`Invariant: newSnapshot[${filePath}] is missing`);
					}

					const resourceDeltas = this.diffResources({
						oldResource,
						newResource,
						path: [],
					});

					changes.push(...resourceDeltas.map((d) => ({ ...d, filePath })));
				}
			}
		}

		return changes;
	}

	diffResources({
		oldResource,
		newResource,
		path,
	}: {
		oldResource: FormatjsResource;
		newResource: FormatjsResource;
		path: Path;
	}): ResourceDelta[] {
		const changes: ResourceDelta[] = [];

		const oldKeys = new Set(Object.keys(oldResource));
		const newKeys = new Set(Object.keys(newResource));

		// Added keys
		for (const key of newKeys) {
			if (!oldKeys.has(key)) {
				if (newKeys.has(key)) {
					const nextPath = [...path, key];

					const newValue = newResource[key];

					if (!newValue) {
						throw new Error(`Invariant: newResource[${key}] is missing`);
					}

					changes.push({
						type: "added",
						resourcePath: nextPath,
						value: newValue,
					});
				}
			}
		}

		// Removed keys
		for (const key of oldKeys) {
			if (!newKeys.has(key)) {
				if (oldKeys.has(key)) {
					const nextPath = [...path, key];
					changes.push({
						type: "removed",
						resourcePath: nextPath,
					});
				}
			}
		}

		// Present in both: dive or compare
		for (const key of newKeys) {
			if (oldKeys.has(key)) {
				if (newKeys.has(key)) {
					const oldValue = oldResource[key];
					const newValue = newResource[key];

					if (!oldValue) {
						throw new Error(`Invariant: oldResource[${key}] is missing`);
					}

					if (!newValue) {
						throw new Error(`Invariant: newResource[${key}] is missing`);
					}

					if (newValue !== oldValue) {
						const nextPath = [...path, key];
						changes.push({
							type: "changed",
							resourcePath: nextPath,
							oldValue: oldValue,
							newValue: newValue,
						});
					}
				}
			}
		}

		return changes;
	}

	getValueFromResource({
		resource,
		resourcePath,
	}: {
		resource: FormatjsResource;
		resourcePath: Path;
	}): string {
		return get(resource, resourcePath);
	}

	updateValuesInResource(params: {
		updates: Update[];
		resource?: FormatjsResource;
	}): FormatjsResource {
		const resource = params.resource ?? {};

		for (const update of params.updates) {
			const { resourcePath, value } = update;
			set(resource, resourcePath, value);
		}

		if (!Value.Check(FormatjsResourceSchema, resource)) {
			throw new TypeError("Formatjs resource validation failed after update");
		}

		return resource;
	}
}
