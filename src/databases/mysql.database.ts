import { SQL } from "bun";
import type { Config } from "../config";
import { BaseDatabase } from "./base.database";

type MySQLDatabaseConfig = Extract<
	Config["database"]["adapter"],
	{ name: "mysql" }
>;

export default class MySQLDatabase extends BaseDatabase {
	private sql: SQL;

	private readonly table;
	private readonly database;
	private readonly keyColumn = "key";
	private readonly valueColumn = "value";

	constructor(config: MySQLDatabaseConfig) {
		super();

		this.table = config.table;
		this.database = config.database;

		this.sql = new SQL({
			adapter: "mysql",
			port: config.port,
			hostname: config.hostname,
			username: config.username,
			password: config.password,
		});
	}

	async initialize(): Promise<void> {
		await this.sql`CREATE DATABASE IF NOT EXISTS ${this.sql(this.database)}`;

		await this.sql`
			CREATE TABLE IF NOT EXISTS ${this.sql(this.database)}.${this.sql(this.table)} (
				${this.sql(this.keyColumn)} VARCHAR(255) PRIMARY KEY,
				${this.sql(this.valueColumn)} TEXT NOT NULL
			)
		`;
	}

	async get(key: string): Promise<string | null> {
		const rows = await this.sql`
			SELECT ${this.sql(this.valueColumn)} FROM ${this.sql(this.database)}.${this.sql(this.table)} 
			WHERE ${this.sql(this.keyColumn)} = ${key}
		`;

		if (rows && rows.length > 0) {
			return rows[0][this.valueColumn];
		}

		return null;
	}

	async set(key: string, content: string): Promise<void> {
		await this.sql`
			INSERT INTO ${this.sql(this.database)}.${this.sql(this.table)} 
			(${this.sql(this.keyColumn)}, ${this.sql(this.valueColumn)}) VALUES (${key}, ${content}) 
			ON DUPLICATE KEY UPDATE ${this.sql(this.valueColumn)} = ${content}
		`;
	}
}
