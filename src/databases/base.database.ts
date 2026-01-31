import type { BaseSource } from "../sources";

/**
 * Base class for database adapters that provide persistent string key-value storage
 */
export abstract class BaseDatabase {
	/**
	 * Initializes the database
	 * Creates necessary files, tables, or connections
	 */
	abstract initialize(): Promise<void>;

	/**
	 * Gets content for a specific key or null if key not found
	 */
	abstract get(key: string): Promise<string | null>;

	/**
	 * Sets content for a specific key, entirely replacing any existing data.
	 * @param options
	 * @param options.key - Unique identifier for the content.
	 * @param options.content - The new content to store.
	 * @param options.source - (Optional) Provide source instance to commit the change.
	 */
	abstract set({
		key,
		content,
		source,
	}: {
		key: string;
		content: string;
		source?: BaseSource;
	}): Promise<void>;
}
