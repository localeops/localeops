import { Value } from "@sinclair/typebox/value";
import get from "lodash/get";
import set from "lodash/set";
import { type Formatting, formatJson } from "../../shared/formatting";
import { BaseFramework } from "../base/base.framework";
import type {
	ResourceDelta,
	ResourcePath,
	ResourceUpdate,
} from "../base/base.types";
import { I18nextResourceSchema } from "./i18next.schema";
import type { I18nextArray, I18nextResource } from "./i18next.types";

export class I18nextFramework extends BaseFramework<I18nextResource> {
	convertedPaths = new Set<string>();

	private formatting: Formatting = {
		eol: "\n",
		indent: "\t",
		tail: "\n",
	};

	deserialize(raw: string) {
		return Value.Parse(I18nextResourceSchema, JSON.parse(raw));
	}

	serialize(resource: I18nextResource) {
		return formatJson({
			resource,
			formatting: this.formatting,
		});
	}

	diff({
		oldResource = {},
		newResource,
		path = [],
	}: {
		oldResource: I18nextResource;
		newResource: I18nextResource;
		path: ResourcePath;
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
							...this.diff({
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
									...this.diff({
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
									...this.diff({
										oldResource: {},
										newResource: newValue,
										path: nextPath,
									}),
								);
							} else if (Array.isArray(oldValue)) {
								changes.push(
									...this.diff({
										oldResource: {},
										newResource: newValue,
										path: nextPath,
									}),
								);
							} else {
								changes.push(
									...this.diff({
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

	resolve({
		resource,
		resourcePath,
	}: {
		resource: I18nextResource;
		resourcePath: ResourcePath;
	}): string {
		const value = get(resource, resourcePath);

		if (value === undefined) {
			throw new Error(`No value at path: ${resourcePath.join(".")}`);
		}

		return value;
	}

	patch(params: {
		updates: ResourceUpdate[];
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
						...this.diff({
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
							...this.diff({
								oldResource: {},
								newResource: newValue,
								path: nextPath,
							}),
						);
					} else if (Array.isArray(oldValue)) {
						changes.push(
							...this.diff({
								oldResource: {},
								newResource: newValue,
								path: nextPath,
							}),
						);
					} else {
						changes.push(
							...this.diff({
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
}
