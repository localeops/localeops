import * as fs from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Type } from "@sinclair/typebox/type";
import { Value } from "@sinclair/typebox/value";
import set from "lodash/set";
import { type I18nResource, State } from "../../core/state";
import { i18nResource } from "../../core/state/state.schema";
import type { PostTranslation } from "../modules/translation/translation.types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const path = join(__dirname, "database.json");

type DatabaseContent = Record<string, I18nResource>;
const DatabaseSchema = Type.Record(Type.String(), i18nResource);

export async function initDatabase() {
	await fs.mkdir(__dirname, { recursive: true });
	try {
		await fs.access(path);
	} catch {
		await fs.writeFile(path, "{}\n", { encoding: "utf8" });
	}
}

export class Database {
	private locale: string;

	constructor(locale: string) {
		this.locale = locale;
	}

	// Get all translated keys and values
	static async getAll(): Promise<DatabaseContent> {
		const content = await fs.readFile(path, { encoding: "utf8" });
		return Value.Parse(DatabaseSchema, JSON.parse(content));
	}

	// Get translated keys and values by locale
	async get() {
		const all = await Database.getAll();
		return all[`${this.locale}`] || {};
	}

	// Update translation for locale
	async update(translations: PostTranslation[]) {
		const all = await Database.getAll();
		const target = all[`${this.locale}`] || {};

		const state = new State();

		const content = state.update({
			state: target,
			translations,
		});

		set(all, `${this.locale}`, content);

		await fs.writeFile(path, JSON.stringify(all, null, 2), {
			encoding: "utf8",
		});
	}
}
