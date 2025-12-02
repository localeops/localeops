import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config";
import { createSource } from "../sources";
import { BaseDatabase } from "./base.database";

/**
 * File-based database adapter that provides persistent string key-value storage
 */

export class FileDatabase extends BaseDatabase {
	private dirPath: string;

	constructor(config: { dirPath: string }) {
		super();
		this.dirPath = config.dirPath;
	}

	async initialize(): Promise<void> {
		await fs.mkdir(this.dirPath, { recursive: true });
	}

	getFilePath(key: string) {
		const fileName = `${key}.json`;
		const filePath = path.join(this.dirPath, fileName);
		return filePath;
	}

	async get(key: string): Promise<string | null> {
		const filePath = this.getFilePath(key);

		if (existsSync(filePath)) {
			const data = await fs.readFile(filePath, "utf8");
			return data;
		}

		return null;
	}

	// TODO: Refactor by moving commiting the change elsewhere
	async set(key: string, content: string): Promise<void> {
		const filePath = this.getFilePath(key);

		await fs.writeFile(filePath, content, "utf8");

		const source = createSource(config.source);

		const commitMessage = `store new snapshot`;

		source.commitFile({ path: filePath, message: commitMessage });
	}
}
