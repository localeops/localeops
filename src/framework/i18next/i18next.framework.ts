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
import { I18nextResourceSchema } from "./i18next.schema";
import type { I18nextArray, I18nextResource } from "./i18next.types";

export class I18nextFramework extends BaseFramework<I18nextResource> {
	convertedPaths = new Set<string>();

	readResourceFile(path: string): {
		resource: I18nextResource;
		raw: string | null;
	} {
		try {
			const raw = fs.readFileSync(path, { encoding: "utf-8" });
			const resource = Value.Parse(I18nextResourceSchema, JSON.parse(raw));
			return { resource, raw };
		} catch {
			return { resource: {}, raw: null };
		}
	}

	diffSnapshots({
		oldSnapshot,
		newSnapshot,
	}: {
		oldSnapshot: Snapshot<I18nextResource>;
		newSnapshot: Snapshot<I18nextResource>;
	}): SnapshotDelta[] {
		const changes: SnapshotDelta[] = [];

		const oldSnapshotFilePaths = new Set(Object.keys(oldSnapshot));
		const newSnapshotFilePaths = new Set(Object.keys(newSnapshot));

		// Added file path
		for (const filePath of newSnapshotFilePaths) {
			if (!oldSnapshotFilePaths.has(filePath)) {
				if (newSnapshotFilePaths.has(filePath)) {
					const newResource = newSnapshot[filePath];

					if (!newResource) {
						throw new Error(`Invariant: newSnapshot[${filePath}] is missing`);
					}

					const resourceDeltas = this.diffResources({
						oldResource: {},
						newResource,
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
						oldResource: oldResource,
						newResource: newResource,
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
		oldResource: I18nextResource;
		newResource: I18nextResource;
		path: Path;
	}): ResourceDelta[] {
		const changes: ResourceDelta[] = [];

		const oldKeys = new Set(Object.keys(oldResource));
		const newKeys = new Set(Object.keys(newResource));

		// Added keys
		for (const key of newKeys) {
			if (!oldKeys.has(key)) {
				if (newResource[key]) {
					const newValue = newResource[key];
					const nextPath = [...path, key];
					if (typeof newValue === "string") {
						changes.push({
							type: "added",
							resourcePath: nextPath,
							value: newValue,
						});
					} else if (Array.isArray(newValue)) {
						changes.push(
							...this.diffArrays({
								oldArr: [],
								newArr: newValue,
								path: nextPath,
							}),
						);
					} else {
						changes.push(
							...this.diffResources({
								oldResource: {},
								newResource: newValue,
								path: nextPath,
							}),
						);
					}
				}
			}
		}

		// Removed keys
		for (const key of oldKeys) {
			if (!newKeys.has(key)) {
				if (oldResource[key]) {
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
					const nextPath = [...path, key];
					const oldValue = oldResource[key];
					const newValue = newResource[key];

					if (oldValue && newValue) {
						if (typeof newValue === "string") {
							if (typeof oldValue === "string") {
								if (newValue !== oldValue) {
									changes.push({
										type: "changed",
										resourcePath: nextPath,
										oldValue: oldValue,
										newValue: newValue,
									});
								}
							} else if (Array.isArray(oldValue)) {
								changes.push({
									type: "changed",
									resourcePath: nextPath,
									oldValue: "",
									newValue: newValue,
								});
							} else {
								changes.push(
									...this.diffResources({
										newResource: {},
										oldResource: oldValue,
										path: nextPath,
									}),
								);
								changes.push({
									type: "changed",
									resourcePath: nextPath,
									oldValue: "",
									newValue: newValue,
								});
							}
						} else if (Array.isArray(newValue)) {
							if (typeof oldValue === "string") {
								changes.push(
									...this.diffArrays({
										oldArr: [],
										newArr: newValue,
										path: nextPath,
									}),
								);
							} else if (Array.isArray(oldValue)) {
								changes.push(
									...this.diffArrays({
										oldArr: oldValue,
										newArr: newValue,
										path: nextPath,
									}),
								);
							} else {
								changes.push(
									...this.diffArrays({
										oldArr: [],
										newArr: newValue,
										path: nextPath,
									}),
								);
							}
						} else {
							if (typeof oldValue === "string") {
								changes.push(
									...this.diffResources({
										oldResource: {},
										newResource: newValue,
										path: nextPath,
									}),
								);
							} else if (Array.isArray(oldValue)) {
								changes.push(
									...this.diffResources({
										oldResource: {},
										newResource: newValue,
										path: nextPath,
									}),
								);
							} else {
								changes.push(
									...this.diffResources({
										oldResource: oldValue,
										newResource: newValue,
										path: nextPath,
									}),
								);
							}
						}
					}
				}
			}
		}

		return changes;
	}

	private diffArrays({
		oldArr,
		newArr,
		path,
	}: {
		oldArr: I18nextArray;
		newArr: I18nextArray;
		path: Array<string | number>;
	}): ResourceDelta[] {
		const changes: ResourceDelta[] = [];
		const maxLen = Math.max(oldArr.length, newArr.length);

		for (let index = 0; index < maxLen; index++) {
			const nextPath = [...path, index];

			const inOld = index < oldArr.length;
			const inNew = index < newArr.length;

			const oldValue = oldArr[index];
			const newValue = newArr[index];

			if (inOld && !inNew && oldValue) {
				changes.push({
					type: "removed",
					resourcePath: nextPath,
				});

				continue;
			}

			if (!inOld && inNew && newValue) {
				if (typeof newValue === "string") {
					changes.push({
						type: "added",
						resourcePath: nextPath,
						value: newValue,
					});
				} else if (Array.isArray(newValue)) {
					changes.push(
						...this.diffArrays({
							oldArr: [],
							newArr: newValue,
							path: nextPath,
						}),
					);
				} else {
					changes.push(
						...this.diffResources({
							newResource: newValue,
							oldResource: {},
							path: nextPath,
						}),
					);
				}

				continue;
			}

			// Present in both: dive or compare
			if (oldValue && newValue) {
				if (typeof newValue === "string") {
					if (typeof oldValue === "string") {
						if (newValue !== oldValue) {
							changes.push({
								type: "changed",
								resourcePath: nextPath,
								oldValue: oldValue,
								newValue: newValue,
							});
						}
					} else if (Array.isArray(oldValue)) {
						changes.push({
							type: "changed",
							resourcePath: nextPath,
							oldValue: "",
							newValue: newValue,
						});
					} else {
						changes.push({
							type: "changed",
							resourcePath: nextPath,
							oldValue: "",
							newValue: newValue,
						});
					}
				} else if (Array.isArray(newValue)) {
					if (typeof oldValue === "string") {
						changes.push(
							...this.diffArrays({
								oldArr: [],
								newArr: newValue,
								path: nextPath,
							}),
						);
					} else if (Array.isArray(oldValue)) {
						changes.push(
							...this.diffArrays({
								oldArr: oldValue,
								newArr: newValue,
								path: nextPath,
							}),
						);
					} else {
						changes.push(
							...this.diffArrays({
								oldArr: [],
								newArr: newValue,
								path: nextPath,
							}),
						);
					}
				} else {
					if (typeof oldValue === "string") {
						changes.push(
							...this.diffResources({
								oldResource: {},
								newResource: newValue,
								path: nextPath,
							}),
						);
					} else if (Array.isArray(oldValue)) {
						changes.push(
							...this.diffResources({
								oldResource: {},
								newResource: newValue,
								path: nextPath,
							}),
						);
					} else {
						changes.push(
							...this.diffResources({
								oldResource: oldValue,
								newResource: newValue,
								path: nextPath,
							}),
						);
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
		resource: I18nextResource;
		resourcePath: Path;
	}): string {
		return get(resource, resourcePath);
	}

	updateValuesInResource(params: {
		updates: Update[];
		resource?: I18nextResource;
	}): I18nextResource {
		const resource = params.resource ?? {};

		for (const update of params.updates) {
			const { resourcePath, value } = update;

			const currentPath: (string | number)[] = [];

			for (let i = 0; i < resourcePath.length; i++) {
				const key = resourcePath[i];
				if (key === undefined) throw new Error("Invalid path key");
				currentPath.push(key);

				if (typeof resourcePath[i + 1] === "number") {
					const pathKey = currentPath.join(".");
					if (!this.convertedPaths.has(pathKey)) {
						if (!Array.isArray(get(resource, currentPath))) {
							set(resource, currentPath, []);
							this.convertedPaths.add(pathKey);
						}
					}
				}
			}

			set(resource, resourcePath, value);
		}

		if (!Value.Check(I18nextResourceSchema, resource)) {
			throw new TypeError(
				"[I18Next] i18n resource validation failed after update",
			);
		}

		return resource;
	}
}
