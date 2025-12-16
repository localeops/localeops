import fs from "node:fs";
import path from "node:path";
import type { Config } from "../../config";
import { logger } from "../../shared/logger";
import type {
	ResourceDelta,
	ResourcePath,
	ResourceUpdate,
	Snapshot,
	SnapshotDelta,
} from "./base.types";

/**
 * Abstract base class for framework-specific translation file management.
 *
 * @template Resource - The framework-specific data structure representing translation
 * file contents. Returned by `deserialize` method for translation file content.
 */
export abstract class BaseFramework<Resource> {
	/** Name of source locale directory (e.g. en) */
	locale: string;

	/** Name of all source files directory (e.g. locales)*/
	directory: string;

	constructor(config: Config["framework"]) {
		this.locale = config.locale;
		this.directory = config.directory;
	}

	/**
	 * Captures the current state of all translation files in the source locale directory.
	 *
	 * Recursively traverses the directory at `{directory}/{locale}`, reads and deserializes
	 * each file, and returns a snapshot mapping relative file paths to their parsed contents.
	 *
	 * @returns Snapshot mapping file paths (relative to the source locale directory) to their deserialized Resource objects.
	 * For example, if a file exists at `{directory}/{locale}/common/buttons.json`, the key will be `common/buttons.json`.
	 *
	 * @throws Error if the source locale directory does not exist or files cannot be read
	 */
	snapshot(): Snapshot<Resource> {
		const sourceLocaleDirPath = `${this.directory}/${this.locale}`;

		const snapshot: Snapshot<Resource> = {};

		const walk = (dirPath: string, filePath: string): Snapshot<Resource> => {
			const entries = fs.readdirSync(dirPath, { withFileTypes: true });

			for (const entry of entries) {
				const fullPath = path.join(dirPath, entry.name);

				const fullRelativePath = path.join(filePath, entry.name);

				if (entry.isDirectory()) {
					walk(fullPath, fullRelativePath);
				} else if (entry.isFile()) {
					const raw = fs.readFileSync(fullPath, { encoding: "utf8" });

					const resource = this.deserialize(raw);

					snapshot[fullRelativePath] = resource;
				}
			}

			return snapshot;
		};

		return walk(sourceLocaleDirPath, "");
	}

	/**
	 * Compares two snapshots to identify translation key-level changes across all files.
	 *
	 * For each file present in the new snapshot, compares it against the old snapshot (if present)
	 * to detect added, changed, or removed translation keys
	 *
	 * @returns Array of SnapshotDelta objects, each containing a file path and a ResourceDelta
	 * describing a specific translation change
	 */
	diffSnapshots({
		oldSnapshot,
		newSnapshot,
	}: {
		oldSnapshot: Snapshot<Resource>;
		newSnapshot: Snapshot<Resource>;
	}): SnapshotDelta[] {
		const deltas: SnapshotDelta[] = [];

		const oldFilePaths = new Set(Object.keys(oldSnapshot));
		const newFilePaths = new Set(Object.keys(newSnapshot));

		for (const filePath of newFilePaths) {
			// Present in both. Compare resources
			if (oldFilePaths.has(filePath)) {
				const oldResource = oldSnapshot[filePath];
				const newResource = newSnapshot[filePath];

				if (!oldResource) {
					throw new Error(`Invariant: oldSnapshot[${filePath}] is missing`);
				}

				if (!newResource) {
					throw new Error(`Invariant: newSnapshot[${filePath}] is missing`);
				}

				const resourceDeltas = this.diff({
					oldResource: oldResource,
					newResource: newResource,
				});

				deltas.push(...resourceDeltas.map((d) => ({ ...d, filePath })));
			} else {
				// Added new file path

				const newResource = newSnapshot[filePath];

				if (!newResource) {
					throw new Error(`Invariant: newSnapshot[${filePath}] is missing`);
				}

				const resourceDeltas = this.diff({
					newResource,
				});

				deltas.push(...resourceDeltas.map((d) => ({ ...d, filePath })));
			}
		}

		// Removed file path
		for (const filePath of oldFilePaths) {
			if (!newFilePaths.has(filePath)) {
				// TODO: handle removed files
				logger.debug(`File ${filePath} was removed`);
			}
		}

		return deltas;
	}

	/**
	 * Resolves a file path relative to source locale directory to its absolute filesystem location for a given locale.
	 *
	 * Combines the configured locales directory, target locale, and relative file path
	 * into an absolute path.
	 *
	 * @param filePath - Relative path within the source locale directory (e.g., "common/buttons.json")
	 * @param locale - Target locale code (e.g., "en", "fr", "de")
	 * @returns Absolute filesystem path to the file (e.g., "/locales/fr/common/buttons.json")
	 */
	resolveFilePath({ filePath, locale }: { filePath: string; locale: string }) {
		return path.resolve(this.directory, locale, filePath);
	}

	/**
	 * Parses raw translation file content into a framework-specific Resource object.
	 *
	 * Implementations should parse the string and validate it against
	 * the framework's resource schema, throwing an error if the format is invalid.
	 *
	 * @param raw - Translation file content as a string
	 * @returns Parsed and validated Resource object
	 * @throws Error if the content cannot be parsed or fails schema validation
	 */
	abstract deserialize(raw: string): Resource;

	/**
	 * Serializes a Resource object into formatted string content ready for file output.
	 *
	 * Implementations should convert the Resource into a properly formatted string.
	 *
	 * @param resource - The Resource object to serialize
	 * @returns Formatted string content that can be written to a file
	 */
	abstract serialize(resource: Resource): string;

	/**
	 * Computes translation differences between two Resource objects.
	 *
	 * When oldResource is undefined, all keys in newResource should be marked as "added".
	 *
	 * @param oldResource - The previous Resource state (undefined for newly created resources)
	 * @param newResource - The current Resource state
	 * @returns Array of ResourceDelta objects, each describing an added, changed, or removed
	 * translation key with its path and value(s)
	 */
	abstract diff({
		oldResource,
		newResource,
	}: {
		oldResource?: Resource;
		newResource: Resource;
	}): ResourceDelta[];

	/**
	 * Applies translation updates to a Resource object.
	 *
	 * Implementations should iterate through the updates array and apply each value at
	 * its specified resourcePath
	 *
	 * When resource is undefined, creates a new Resource and applies all updates to it.
	 *
	 * @param resource - The existing Resource to modify (undefined to create a new one)
	 * @param updates - Array of updates to apply, each containing a resourcePath and value
	 * @returns The modified or newly created Resource object
	 */
	abstract patch({
		resource,
		updates,
	}: {
		resource?: Resource;
		updates: ResourceUpdate[];
	}): Resource;

	/**
	 * Retrieves the translation string value at a specific path within a Resource.
	 *
	 * Implementations should traverse the Resource using the provided path array and
	 * return the string value found at that location.
	 *
	 * @param resource - The Resource object to query
	 * @param resourcePath - ResourcePath array specifying the location of the translation key
	 * @returns The translation string value at the specified path
	 * @throws Error if the resourcePath does not exist in the resource
	 */
	abstract resolve({
		resource,
		resourcePath,
	}: {
		resource: Resource;
		resourcePath: ResourcePath;
	}): string;
}
