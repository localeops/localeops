import fs from "node:fs";
import path from "node:path";
import type { Config } from "../../config";
import type {
	Path,
	ResourceDelta,
	Snapshot,
	SnapshotDelta,
	Update,
} from "./base.types";

/**
 * Abstract base class for framework-specific translation file management.
 *
 * @template Resource - Data structure representing a single translation file's contents
 * @template Snapshot - Record mapping file paths to Resources: Record<string, Resource>
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
	 * Reads and parses a translation file from disk.
	 *
	 * @param path - Absolute file path
	 * @returns Resource and raw file content (null if file doesn't exist)
	 */
	abstract readResourceFile(path: string): {
		resource: Resource;
		raw: string | null;
	};

	/**
	 * Snapshots all translation files in the source locale directory.
	 * Used to capture current state for future comparison.
	 *
	 * @returns Snapshot with file paths (relative to {directory}/{locale}) as keys and Resources as values
	 */
	snapshotSourceLocaleDir(): Snapshot<Resource> {
		const sourceLocaleDirPath = `${this.directory}/${this.locale}`;

		const aggregated: Snapshot<Resource> = {};

		const walk = (
			dirPath: string,
			relativePath: string,
		): Snapshot<Resource> => {
			const entries = fs.readdirSync(dirPath, { withFileTypes: true });

			for (const entry of entries) {
				const fullPath = path.join(dirPath, entry.name);
				const fullRelativePath = path.join(relativePath, entry.name);

				if (entry.isDirectory()) {
					walk(fullPath, fullRelativePath);
				} else if (entry.isFile()) {
					const { resource } = this.readResourceFile(fullPath);
					aggregated[fullRelativePath] = resource;
				}
			}

			return aggregated;
		};

		return walk(sourceLocaleDirPath, "");
	}

	/**
	 * Compares two snapshots and identifies all Resource-level changes.
	 *
	 * @returns Array of deltas with filePath and ResourceDelta properties
	 */
	abstract diffSnapshots({
		oldSnapshot,
		newSnapshot,
	}: {
		oldSnapshot: Snapshot<Resource>;
		newSnapshot: Snapshot<Resource>;
	}): SnapshotDelta[];

	/**
	 * Compares two Resources and identifies changes.
	 *
	 * @returns Array of deltas (type: "added" | "changed" | "removed") with resourcePath
	 */
	abstract diffResources({
		oldResource,
		newResource,
	}: {
		oldResource: Resource;
		newResource: Resource;
	}): ResourceDelta[];

	/**
	 * Applies updates to a Resource.
	 * Used to update snapshot and target locale files with received translations
	 *
	 * @returns Updated Resource
	 */
	abstract updateValuesInResource({
		resource,
		updates,
	}: {
		resource?: Resource;
		updates: Update[];
	}): Resource;

	/**
	 * Retrieves a value from a Resource by its path.
	 *
	 * @param resourcePath - Path array to the value (e.g., ["user", "greeting"])
	 * @returns Translation string at the specified path
	 */
	abstract getValueFromResource({
		resource,
		resourcePath,
	}: {
		resource: Resource;
		resourcePath: Path;
	}): string;

	/**
	 * Constructs full file path: {directory}/{locale}/{filePath}
	 */
	getFullFilePath({ filePath, locale }: { filePath: string; locale: string }) {
		return `${this.directory}/${locale}/${filePath}`;
	}
}
