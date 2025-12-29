import { Value } from "@sinclair/typebox/value";
import get from "lodash/get";
import set from "lodash/set";
import { FrameworkError } from "../../core/errors";
import type { Formatting } from "../../shared/formatting";
import { formatJson } from "../../shared/formatting";
import { BaseFramework } from "../base/base.framework";
import type {
	ResourceDelta,
	ResourcePath,
	ResourceUpdate,
} from "../base/base.types";
import { FormatjsResourceSchema } from "./formatjs.schema";
import type { FormatjsResource } from "./formatjs.types";

export class FormatjsFramework extends BaseFramework<FormatjsResource> {
	private formatting: Formatting = {
		eol: "\n",
		indent: "\t",
		tail: "\n",
	};

	deserialize(raw: string) {
		return Value.Parse(FormatjsResourceSchema, JSON.parse(raw));
	}

	serialize(resource: FormatjsResource) {
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
		oldResource: FormatjsResource;
		newResource: FormatjsResource;
		path: ResourcePath;
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
						throw new FrameworkError(
							`Invariant: newResource[${key}] is missing`,
						);
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
						throw new FrameworkError(
							`Invariant: oldResource[${key}] is missing`,
						);
					}

					if (!newValue) {
						throw new FrameworkError(
							`Invariant: newResource[${key}] is missing`,
						);
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

	resolve({
		resource,
		resourcePath,
	}: {
		resource: FormatjsResource;
		resourcePath: ResourcePath;
	}): string {
		const value = get(resource, resourcePath);

		if (value === undefined) {
			throw new FrameworkError(`No value at path: ${resourcePath.join(".")}`);
		}

		return value;
	}

	patch(params: {
		updates: ResourceUpdate[];
		resource?: FormatjsResource;
	}): FormatjsResource {
		const resource = params.resource ?? {};

		for (const update of params.updates) {
			const { resourcePath, value } = update;
			set(resource, resourcePath, value);
		}

		if (!Value.Check(FormatjsResourceSchema, resource)) {
			throw new FrameworkError(
				"Formatjs resource validation failed after update",
			);
		}

		return resource;
	}
}
