import { Value } from "@sinclair/typebox/value";
import { get, pullAt, set, unset } from "lodash";
import { i18nResource } from "./state.schema";
import type {
	Delta,
	I18nArray,
	I18nObject,
	RemovedDelta,
	Translation,
} from "./state.types";

export class State {
	convertedPaths = new Set<string>();

	update({
		state,
		translations,
	}: {
		state: I18nObject;
		translations: Translation[];
	}): I18nObject {
		for (const translation of translations) {
			const { path, value } = translation;
			const currentPath: (string | number)[] = [];

			for (let i = 0; i < path.length; i++) {
				const key = path[i];
				if (key === undefined) throw new Error("Invalid path key");
				currentPath.push(key);

				if (typeof path[i + 1] === "number") {
					const pathKey = currentPath.join(".");
					if (!this.convertedPaths.has(pathKey)) {
						if (!Array.isArray(get(state, currentPath))) {
							set(state, currentPath, []);
							this.convertedPaths.add(pathKey);
						}
					}
				}
			}

			set(state, path, value);
		}

		if (!State.isI18NResource(state)) {
			throw new TypeError("i18n resource validation failed after update");
		}

		return state;
	}

	static removeKeys({
		state,
		deltas,
	}: {
		state: I18nObject;
		deltas: RemovedDelta[];
	}): I18nObject {
		const modifiedArrays = new Map<string, number[]>();

		for (const { leafPath, key, path } of deltas) {
			if (typeof key === "number") {
				const leafPathKey = leafPath.join(".");
				if (!modifiedArrays.has(leafPathKey)) {
					modifiedArrays.set(leafPathKey, []);
				}
				modifiedArrays.get(leafPathKey)?.push(key);
			} else {
				unset(state, path);
			}
		}

		for (const [leafPath, keys] of modifiedArrays) {
			const leaf = get(state, leafPath);
			if (!Array.isArray(leaf)) throw new Error("digit key inside object");
			pullAt(leaf, keys);
		}

		if (!Value.Check(i18nResource, state)) {
			throw new TypeError("i18n resource validation failed after key removal");
		}

		return state;
	}

	static diffObjects({
		oldObj,
		newObj,
		path = [],
	}: {
		oldObj: I18nObject;
		newObj: I18nObject;
		path?: Array<string | number>;
	}): Delta[] {
		const changes: Delta[] = [];
		const oldKeys = new Set(Object.keys(oldObj));
		const newKeys = new Set(Object.keys(newObj));

		// Added keys
		for (const key of newKeys) {
			if (!oldKeys.has(key)) {
				if (newObj[key]) {
					const newValue = newObj[key];
					const nextPath = [...path, key];
					if (typeof newValue === "string") {
						changes.push({
							type: "added",
							path: nextPath,
							leafPath: [...path],
							key,
							value: newValue,
						});
					} else if (Array.isArray(newValue)) {
						changes.push(
							...State.diffArrays({
								oldArr: [],
								newArr: newValue,
								path: nextPath,
							}),
						);
					} else {
						changes.push(
							...State.diffObjects({
								oldObj: {},
								newObj: newValue,
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
				if (oldObj[key]) {
					const nextPath = [...path, key];
					changes.push({
						type: "removed",
						path: nextPath,
						leafPath: [...path],
						key,
					});
				}
			}
		}

		// Present in both: dive or compare
		for (const key of newKeys) {
			const nextPath = [...path, key];
			const oldValue = oldObj[key];
			const newValue = newObj[key];

			if (oldValue && newValue) {
				if (typeof newValue === "string") {
					if (typeof oldValue === "string") {
						if (newValue !== oldValue) {
							changes.push({
								type: "changed",
								path: nextPath,
								leafPath: [...path],
								key,
								oldValue: oldValue,
								newValue: newValue,
							});
						}
					} else if (Array.isArray(oldValue)) {
						changes.push({
							type: "changed",
							path: nextPath,
							leafPath: [...path],
							key,
							oldValue: "",
							newValue: newValue,
						});
					} else {
						changes.push(
							...State.diffObjects({
								newObj: {},
								oldObj: oldValue,
								path: nextPath,
							}),
						);
						changes.push({
							type: "changed",
							path: nextPath,
							leafPath: [...path],
							key,
							oldValue: "",
							newValue: newValue,
						});
					}
				} else if (Array.isArray(newValue)) {
					if (typeof oldValue === "string") {
						changes.push(
							...State.diffArrays({
								oldArr: [],
								newArr: newValue,
								path: nextPath,
							}),
						);
					} else if (Array.isArray(oldValue)) {
						changes.push(
							...State.diffArrays({
								oldArr: oldValue,
								newArr: newValue,
								path: nextPath,
							}),
						);
					} else {
						changes.push(
							...State.diffArrays({
								oldArr: [],
								newArr: newValue,
								path: nextPath,
							}),
						);
					}
				} else {
					if (typeof oldValue === "string") {
						changes.push(
							...State.diffObjects({
								oldObj: {},
								newObj: newValue,
								path: nextPath,
							}),
						);
					} else if (Array.isArray(oldValue)) {
						changes.push(
							...State.diffObjects({
								oldObj: {},
								newObj: newValue,
								path: nextPath,
							}),
						);
					} else {
						changes.push(
							...State.diffObjects({
								oldObj: oldValue,
								newObj: newValue,
								path: nextPath,
							}),
						);
					}
				}
			}
		}

		return changes;
	}

	private static diffArrays({
		oldArr,
		newArr,
		path,
	}: {
		oldArr: I18nArray;
		newArr: I18nArray;
		path: Array<string | number>;
	}): Delta[] {
		const changes: Delta[] = [];
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
					path: nextPath,
					leafPath: [...path],
					key: index,
				});

				continue;
			}

			if (!inOld && inNew && newValue) {
				if (typeof newValue === "string") {
					changes.push({
						type: "added",
						path: nextPath,
						leafPath: [...path],
						key: index,
						value: newValue,
					});
				} else if (Array.isArray(newValue)) {
					changes.push(
						...State.diffArrays({
							oldArr: [],
							newArr: newValue,
							path: nextPath,
						}),
					);
				} else {
					changes.push(
						...State.diffObjects({
							newObj: newValue,
							oldObj: {},
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
								path: nextPath,
								leafPath: [...path],
								key: index,
								oldValue: oldValue,
								newValue: newValue,
							});
						}
					} else if (Array.isArray(oldValue)) {
						changes.push({
							type: "changed",
							path: nextPath,
							leafPath: [...path],
							key: index,
							oldValue: "",
							newValue: newValue,
						});
					} else {
						changes.push({
							type: "changed",
							path: nextPath,
							leafPath: [...path],
							key: index,
							oldValue: "",
							newValue: newValue,
						});
					}
				} else if (Array.isArray(newValue)) {
					if (typeof oldValue === "string") {
						changes.push(
							...State.diffArrays({
								oldArr: [],
								newArr: newValue,
								path: nextPath,
							}),
						);
					} else if (Array.isArray(oldValue)) {
						changes.push(
							...State.diffArrays({
								oldArr: oldValue,
								newArr: newValue,
								path: nextPath,
							}),
						);
					} else {
						changes.push(
							...State.diffArrays({
								oldArr: [],
								newArr: newValue,
								path: nextPath,
							}),
						);
					}
				} else {
					if (typeof oldValue === "string") {
						changes.push(
							...State.diffObjects({
								oldObj: {},
								newObj: newValue,
								path: nextPath,
							}),
						);
					} else if (Array.isArray(oldValue)) {
						changes.push(
							...State.diffObjects({
								oldObj: {},
								newObj: newValue,
								path: nextPath,
							}),
						);
					} else {
						changes.push(
							...State.diffObjects({
								oldObj: oldValue,
								newObj: newValue,
								path: nextPath,
							}),
						);
					}
				}
			}
		}

		return changes;
	}

	static isI18NResource(value: unknown) {
		return Value.Check(i18nResource, value);
	}
}
