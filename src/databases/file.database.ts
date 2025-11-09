import fs from "node:fs/promises";
import {
	BaseDatabase,
	type DatabaseArray,
	type DatabaseContent,
	type DatabaseRecord,
} from "./base.database";

/**
 * File-based database adapter that tracks translation progress by storing
 * snapshots of source language text for each target locale. This enables
 * detection of new keys and stale translations when source text changes.
 */
export class FileDatabase extends BaseDatabase {
	private path: string;

	constructor(config: { path: string }) {
		super();
		this.path = config.path;
	}

	async initialize(): Promise<void> {
		try {
			await fs.access(this.path);
		} catch {
			// File doesn't exist, create empty database
			await fs.writeFile(this.path, JSON.stringify({}, null, 2), "utf8");
		}
	}

	async getAll(): Promise<DatabaseContent> {
		try {
			const content = await fs.readFile(this.path, "utf8");
			return JSON.parse(content) as DatabaseContent;
		} catch {
			return {};
		}
	}

	async get(key: string): Promise<DatabaseRecord | DatabaseArray> {
		const all = await this.getAll();
		return all[key] ?? {};
	}

	async set(
		key: string,
		content: DatabaseRecord | DatabaseArray,
	): Promise<void> {
		const all = await this.getAll();
		all[key] = content;
		await fs.writeFile(this.path, JSON.stringify(all, null, 2), "utf8");
	}
}
