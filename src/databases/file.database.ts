import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config";
import { createSource } from "../sources";
import { BaseDatabase } from "./base.database";

export class FileDatabase extends BaseDatabase {
	private dirPath: string;

	constructor(config: { dirPath: string }) {
		super();
		this.dirPath = config.dirPath;
	}

	async initialize(): Promise<void> {}

	getFilePath(key: string) {
		const fileName = `${key}.snapshot.json`;
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

	async set({
		key,
		content,
		commit,
	}: {
		key: string;
		content: string;
		commit: boolean;
	}): Promise<void> {
		await fs.mkdir(this.dirPath, { recursive: true });

		const filePath = this.getFilePath(key);

		await fs.writeFile(filePath, content, "utf8");

		if (commit) {
			const source = createSource(config.source);

			const commitMessage = `chore(i18n): update snapshot for locale "${key}"`;

			source.commitFile({ path: filePath, message: commitMessage });
		}
	}
}
