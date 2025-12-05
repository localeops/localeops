import { Database } from "bun:sqlite";
import { type Config, config } from "../config";
import { createSource } from "../sources";
import { BaseDatabase } from "./base.database";

type SqliteDatabaseConfig = Extract<
	Config["database"]["adapter"],
	{ name: "sqlite" }
>;

export class SqliteDatabase extends BaseDatabase {
	private db: Database;

	private readonly table;
	private readonly keyColumn = "key";
	private readonly valueColumn = "value";

	constructor(config: SqliteDatabaseConfig) {
		super();

		this.table = config.table;

		this.db = new Database(config.path);
	}

	async initialize(): Promise<void> {
		this.db.run(`
			CREATE TABLE IF NOT EXISTS ${this.table} (
				${this.keyColumn} TEXT PRIMARY KEY,
				${this.valueColumn} TEXT NOT NULL
			)
		`);
	}

	async get(key: string): Promise<string | null> {
		const result = this.db
			.query<{ value: string }, [string]>(
				`SELECT ${this.valueColumn} FROM ${this.table} WHERE ${this.keyColumn} = ?`,
			)
			.get(key);

		if (result) {
			return result.value;
		}

		return null;
	}

	async set(key: string, content: string): Promise<void> {
		this.db.run(
			`INSERT INTO ${this.table} (${this.keyColumn}, ${this.valueColumn}) VALUES (?, ?)
			 ON CONFLICT(${this.keyColumn}) DO UPDATE SET ${this.valueColumn} = excluded.${this.valueColumn}`,
			[key, content],
		);

		const source = createSource(config.source);

		const commitMessage = `chore(i18n): update snapshot for locale "${key}"`;

		source.commitFile({ path: this.db.filename, message: commitMessage });
	}
}
