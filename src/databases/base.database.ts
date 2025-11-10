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
	 * Gets content for a specific key
	 */
	abstract get(key: string): Promise<string | null>;

	/**
	 * Sets content for a specific key
	 * Replaces existing content entirely
	 */
	abstract set(key: string, content: string): Promise<void>;
}
