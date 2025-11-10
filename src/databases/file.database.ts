import fs from "node:fs/promises";
import path from "node:path";
import { type Static, Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { BaseDatabase } from "./base.database";

/**
 * File-based database adapter that provides persistent string key-value storage
 */

const Schema = Type.Record(Type.String(), Type.String());

type Content = Static<typeof Schema>;

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
			this.writeFile({});
		}
	}

	async get(key: string): Promise<string | null> {
		const all = await this.getAll();
		const value = all[key];
		return value ?? null;
	}

	async set(key: string, content: string): Promise<void> {
		const all = await this.getAll();
		all[key] = content;
		this.writeFile(all);
	}

	private async getAll(): Promise<Content> {
		const raw = await fs.readFile(this.path, "utf8");
		const contents = JSON.parse(raw);
		return Value.Parse(Schema, contents);
	}

	private async writeFile(content: Content) {
		await fs.mkdir(path.dirname(this.path), { recursive: true });
		await fs.writeFile(this.path, JSON.stringify(content, null, 2), "utf8");
	}
}
