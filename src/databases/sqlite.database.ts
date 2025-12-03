import { Database } from "bun:sqlite";
import { BaseDatabase } from "./base.database";

export class SqliteDatabase extends BaseDatabase {
	private db: Database;
	private readonly keyColumn = "key";
	private readonly valueColumn = "value";
	private readonly tableName = "localeops";

	constructor(config: { path: string }) {
		super();

		this.db = new Database(config.path);
	}

	async initialize(): Promise<void> {
		// Create table if it doesn't exist
		this.db.run(`
			CREATE TABLE IF NOT EXISTS ${this.tableName} (
				${this.keyColumn} TEXT PRIMARY KEY,
				${this.valueColumn} TEXT NOT NULL
			)
		`);
	}

	async get(key: string): Promise<string | null> {
		const result = this.db
			.query<{ value: string }, [string]>(
				`SELECT ${this.valueColumn} FROM ${this.tableName} WHERE ${this.keyColumn} = ?`,
			)
			.get(key);

		if (result) {
			return result.value;
		}

		return null;
	}

	async set(key: string, content: string): Promise<void> {
		this.db.run(
			`INSERT INTO ${this.tableName} (${this.keyColumn}, ${this.valueColumn}) VALUES (?, ?)
			 ON CONFLICT(${this.keyColumn}) DO UPDATE SET ${this.valueColumn} = excluded.${this.valueColumn}`,
			[key, content],
		);
	}
}
