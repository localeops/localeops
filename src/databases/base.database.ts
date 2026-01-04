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
	 * Sets content for a specific key
	 * Replaces existing content entirely
	 * @param commit Whether to commit changes to the source control
	 */
	abstract set({
		key,
		content,
		commit,
	}: {
		key: string;
		content: string;
		commit: boolean;
	}): Promise<void>;
}
