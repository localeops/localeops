/**
 * Represents a primitive value in the database
 */
export type DatabaseValue =
	| string
	| number
	| boolean
	| DatabaseArray
	| DatabaseRecord;

/**
 * Represents an array of database values
 */
export type DatabaseArray = DatabaseValue[];

/**
 * Represents a nested object structure in the database
 */
export type DatabaseRecord = { [key: string]: DatabaseValue };

/**
 * Represents the entire database content (key-value pairs)
 * Keys are target locale codes (e.g., "en", "es", "fr")
 * Values contain snapshots of source language text used to track translation
 * progress and detect when source text becomes stale
 */
export type DatabaseContent = Record<string, DatabaseRecord | DatabaseArray>;

/**
 * Base class for database adapters that provide persistent storage
 */
export abstract class BaseDatabase {
	/**
	 * Initializes the database
	 * Creates necessary files, tables, or connections
	 */
	abstract initialize(): Promise<void>;

	/**
	 * Gets all key-value pairs from the database
	 * Returns the entire database content
	 */
	abstract getAll(): Promise<DatabaseContent>;

	/**
	 * Gets content for a specific key
	 * Returns empty object if key doesn't exist
	 */
	abstract get(key: string): Promise<DatabaseRecord | DatabaseArray>;

	/**
	 * Sets content for a specific key
	 * Replaces existing content entirely
	 */
	abstract set(
		key: string,
		content: DatabaseRecord | DatabaseArray,
	): Promise<void>;
}
