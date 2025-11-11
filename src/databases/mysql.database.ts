import { SQL } from "bun";
import type { Config } from "../config";
import { BaseDatabase } from "./base.database";

type MySQLDatabaseConfig = Extract<
	Config["database"]["adapter"],
	{ name: "mysql" }
>;

/**
 * MySQL-based database adapter that provides persistent string key-value storage
 */
export default class MySQLDatabase extends BaseDatabase {
	private sql: SQL;

	private readonly keyColumn = "key";
	private readonly valueColumn = "value";
	private readonly tableName = "localeops";
	private readonly databaseName = "localeops";

	private readonly escapedKeyColumn: SQL.Query<string>;
	private readonly escapedValueColumn: SQL.Query<string>;
	private readonly escapedTableName: SQL.Query<string>;
	private readonly escapedDatabaseName: SQL.Query<string>;

	constructor(config: MySQLDatabaseConfig) {
		super();

		this.sql = new SQL({
			adapter: "mysql",
			port: config.port,
			hostname: config.hostname,
			username: config.username,
			password: config.password,
		});

		this.escapedKeyColumn = this.sql(this.keyColumn);
		this.escapedValueColumn = this.sql(this.valueColumn);
		this.escapedTableName = this.sql(this.tableName);
		this.escapedDatabaseName = this.sql(this.databaseName);
	}

	async initialize(): Promise<void> {
		await this.sql`CREATE DATABASE IF NOT EXISTS ${this.escapedDatabaseName}`;

		await this.sql`
			CREATE TABLE IF NOT EXISTS ${this.escapedDatabaseName}.${this.escapedTableName} (
				${this.escapedKeyColumn} VARCHAR(255) PRIMARY KEY,
				${this.escapedValueColumn} TEXT NOT NULL
			)
		`;
	}

	async get(key: string): Promise<string | null> {
		const rows = await this.sql`
			SELECT ${this.escapedValueColumn} FROM ${this.escapedDatabaseName}.${this.escapedTableName} 
			WHERE ${this.escapedKeyColumn} = ${key}
		`;

		if (rows && rows.length > 0) {
			return rows[0][this.valueColumn];
		}

		return null;
	}

	async set(key: string, content: string): Promise<void> {
		await this.sql`
			INSERT INTO ${this.escapedDatabaseName}.${this.escapedTableName} 
			(${this.escapedKeyColumn}, ${this.escapedValueColumn}) VALUES (${key}, ${content}) 
			ON DUPLICATE KEY UPDATE ${this.escapedValueColumn} = ${content}
		`;
	}
}
