import { Database } from "bun:sqlite";
import {
	BaseDatabase,
	type DatabaseArray,
	type DatabaseContent,
	type DatabaseRecord,
} from "./base.database";

/**
 * SQLite-based database adapter that tracks translation progress by storing
 * snapshots of source language text for each target locale. This enables
 * detection of new keys and stale translations when source text changes.
 */
export class SqliteDatabase extends BaseDatabase {
	private db: Database;
	private readonly tableName = "translation_progress";

	constructor(config: { path: string }) {
		super();
		this.db = new Database(config.path);
	}

	async initialize(): Promise<void> {
		// Create table if it doesn't exist
		this.db.run(`
			CREATE TABLE IF NOT EXISTS ${this.tableName} (
				target_locale TEXT PRIMARY KEY,
				source_snapshot TEXT NOT NULL
			)
		`);
	}

	async getAll(): Promise<DatabaseContent> {
		const rows = this.db
			.query<{ target_locale: string; source_snapshot: string }, []>(
				`SELECT target_locale, source_snapshot FROM ${this.tableName}`,
			)
			.all();

		const result: DatabaseContent = {};
		for (const row of rows) {
			result[row.target_locale] = JSON.parse(row.source_snapshot) as
				| DatabaseRecord
				| DatabaseArray;
		}
		return result;
	}

	async get(key: string): Promise<DatabaseRecord | DatabaseArray> {
		const row = this.db
			.query<{ source_snapshot: string }, [string]>(
				`SELECT source_snapshot FROM ${this.tableName} WHERE target_locale = ?`,
			)
			.get(key);

		if (!row) {
			return {};
		}

		return JSON.parse(row.source_snapshot) as DatabaseRecord | DatabaseArray;
	}

	async set(
		key: string,
		content: DatabaseRecord | DatabaseArray,
	): Promise<void> {
		const contentStr = JSON.stringify(content);

		this.db.run(
			`INSERT INTO ${this.tableName} (target_locale, source_snapshot) VALUES (?, ?)
			 ON CONFLICT(target_locale) DO UPDATE SET source_snapshot = excluded.source_snapshot`,
			[key, contentStr],
		);
	}
}
