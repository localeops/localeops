import type { Delta } from "./state-manager.types";

// TODO:
// Improve logic for diff function (remove diffAny)
// When more than 1 argument in the func, use objects
// if func name diffObjects, params can be new and old
export class StateManager {
	/**
	 * Compute a structured diff between two nested JSON-compatible values.
	 * - Identifies adds/removes/changes
	 * - Reports the owning leaf object for each change
	 */
	diff(oldDoc: unknown, newDoc: unknown): Delta[] {
		const notPlainObject =
			!StateManager.isPlainObject(oldDoc) ||
			!StateManager.isPlainObject(newDoc);

		if (notPlainObject) {
			throw new TypeError("Expects both oldDoc and newDoc to be plain objects");
		}

		return StateManager.diffAny(oldDoc, newDoc, []);
	}

	private static diffAny(
		oldValue: unknown,
		newValue: unknown,
		currentPath: Array<string | number>,
	): Delta[] {
		if (
			StateManager.isPlainObject(oldValue) &&
			StateManager.isPlainObject(newValue)
		) {
			return StateManager.diffObjects(oldValue, newValue, currentPath);
		}

		// If both are arrays, compare by index
		if (Array.isArray(oldValue) && Array.isArray(newValue)) {
			return StateManager.diffArrays(oldValue, newValue, currentPath);
		}

		// If types differ or at least one is primitive or non-plain object, treat as changed at this path
		// TODO: Think about this one
		if (oldValue === newValue) {
			return [];
		}

		// Changing the value at the current path (leaf is the parent of the last segment)
		const leafPath = currentPath.slice(0, -1);
		const key = currentPath[currentPath.length - 1] ?? "";
		return [
			{
				type: "changed",
				path: currentPath,
				leafPath,
				key,
				oldValue,
				newValue,
			},
		];
	}

	private static diffObjects(
		oldObj: Record<string, unknown>,
		newObj: Record<string, unknown>,
		currentPath: Array<string | number>,
	): Delta[] {
		const changes: Delta[] = [];
		const oldKeys = new Set(Object.keys(oldObj));
		const newKeys = new Set(Object.keys(newObj));

		// Added keys
		for (const key of newKeys) {
			if (!oldKeys.has(key)) {
				const newValue = newObj[key];
				const nextPath = [...currentPath, key];

				// If the added value is an object or array, decompose it into primitive changes
				if (StateManager.isPlainObject(newValue)) {
					changes.push(...StateManager.diffObjects({}, newValue, nextPath));
				} else if (Array.isArray(newValue)) {
					changes.push(...StateManager.diffArrays([], newValue, nextPath));
				} else {
					changes.push({
						type: "added",
						path: nextPath,
						leafPath: [...currentPath],
						key,
						value: newValue,
					});
				}
			}
		}

		// Removed keys
		for (const key of oldKeys) {
			if (!newKeys.has(key)) {
				const oldValue = oldObj[key];
				const nextPath = [...currentPath, key];

				// If the removed value is an object or array, decompose it into primitive removed changes
				if (StateManager.isPlainObject(oldValue)) {
					changes.push(
						...StateManager.diffObjects(
							oldValue as Record<string, unknown>,
							{},
							nextPath,
						),
					);
				} else if (Array.isArray(oldValue)) {
					changes.push(...StateManager.diffArrays(oldValue, [], nextPath));
				} else {
					changes.push({
						type: "removed",
						path: nextPath,
						leafPath: [...currentPath],
						key,
					});
				}
			}
		}

		// Present in both: dive or compare
		for (const key of newKeys) {
			if (!oldKeys.has(key)) continue; // already handled as added
			const nextPath = [...currentPath, key];
			const a = oldObj[key]; // FIXME: we need to rename a and b to be better names
			const b = newObj[key];

			if (StateManager.isPlainObject(a) && StateManager.isPlainObject(b)) {
				changes.push(...StateManager.diffObjects(a, b, nextPath));
				continue;
			}

			if (Array.isArray(a) && Array.isArray(b)) {
				changes.push(...StateManager.diffArrays(a, b, nextPath));
				continue;
			}

			// Handle type changes by decomposing complex values
			if (a !== b) {
				if (StateManager.isPlainObject(b)) {
					// Changed to object: decompose the object into primitive changes
					changes.push(...StateManager.diffObjects({}, b, nextPath));
				} else if (Array.isArray(b)) {
					// Changed to array: decompose the array into primitive changes
					changes.push(...StateManager.diffArrays([], b, nextPath));
				} else if (StateManager.isPlainObject(a)) {
					// Object changed to primitive: decompose the old object into removed changes
					changes.push(...StateManager.diffObjects(a, {}, nextPath));
					// Then add the new primitive value
					changes.push({
						type: "added",
						path: nextPath,
						leafPath: [...currentPath],
						key,
						value: b,
					});
				} else if (Array.isArray(a)) {
					// Array changed to primitive: decompose the old array into removed changes
					changes.push(...StateManager.diffArrays(a, [], nextPath));
					// Then add the new primitive value
					changes.push({
						type: "added",
						path: nextPath,
						leafPath: [...currentPath],
						key,
						value: b,
					});
				} else {
					// Both are primitives: report as changed
					changes.push({
						type: "changed",
						path: nextPath,
						leafPath: [...currentPath],
						key,
						oldValue: a,
						newValue: b,
					});
				}
			}
		}

		return changes;
	}

	private static diffArrays(
		oldArr: unknown[],
		newArr: unknown[],
		currentPath: Array<string | number>,
	): Delta[] {
		const changes: Delta[] = [];
		const maxLen = Math.max(oldArr.length, newArr.length);

		for (let index = 0; index < maxLen; index++) {
			const inOld = index < oldArr.length;
			const inNew = index < newArr.length;

			if (inOld && !inNew) {
				const oldValue = oldArr[index];
				const nextPath = [...currentPath, index];

				// If the removed value is an object or array, decompose it into primitive removed changes
				if (StateManager.isPlainObject(oldValue)) {
					changes.push(
						...StateManager.diffObjects(
							oldValue as Record<string, unknown>,
							{},
							nextPath,
						),
					);
				} else if (Array.isArray(oldValue)) {
					changes.push(...StateManager.diffArrays(oldValue, [], nextPath));
				} else {
					changes.push({
						type: "removed",
						path: nextPath,
						leafPath: [...currentPath],
						key: index,
					});
				}
				continue;
			}

			if (!inOld && inNew) {
				const newValue = newArr[index];
				const nextPath = [...currentPath, index];

				// If the added value is an object or array, decompose it into primitive changes
				if (StateManager.isPlainObject(newValue)) {
					changes.push(
						...StateManager.diffObjects(
							{},
							newValue as Record<string, unknown>,
							nextPath,
						),
					);
				} else if (Array.isArray(newValue)) {
					changes.push(...StateManager.diffArrays([], newValue, nextPath));
				} else {
					changes.push({
						type: "added",
						path: nextPath,
						leafPath: [...currentPath],
						key: index,
						value: newValue,
					});
				}
				continue;
			}

			// Both present
			const a = oldArr[index];
			const b = newArr[index];
			const nextPath = [...currentPath, index];

			if (StateManager.isPlainObject(a) && StateManager.isPlainObject(b)) {
				changes.push(...StateManager.diffObjects(a, b, nextPath));
				continue;
			}

			if (Array.isArray(a) && Array.isArray(b)) {
				changes.push(...StateManager.diffArrays(a, b, nextPath));
				continue;
			}

			if (a !== b) {
				changes.push({
					type: "changed",
					path: nextPath,
					leafPath: [...currentPath],
					key: index,
					oldValue: a,
					newValue: b,
				});
			}
		}

		return changes;
	}

	/**
	 * Checks if a value is a plain object.
	 * A plain object is a simple key-value object literal (e.g., {key: value})
	 * created directly from Object.prototype, not an instance of a class,
	 * array, or other special object type like Date, Map, Set, etc.
	 */
	private static isPlainObject(
		value: unknown,
	): value is Record<string, unknown> {
		return (
			value !== null &&
			typeof value === "object" &&
			!Array.isArray(value) &&
			Object.getPrototypeOf(value) === Object.prototype
		);
	}
}
