import * as fs from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Type } from "@sinclair/typebox/type";
import { Value } from "@sinclair/typebox/value";
import set from "lodash/set";
import { type I18nResource, State } from "../../core/state";
import { i18nResource } from "../../core/state/state.schema";
import type { PostTranslation } from "../modules/translation/translation.types";

type DatabaseContent = Record<string, I18nResource>;
const DatabaseSchema = Type.Record(Type.String(), i18nResource);

const isProd = process.env.NODE_ENV === "production";
const exec = dirname(process.execPath);
const dev = dirname(fileURLToPath(import.meta.url));
const base = isProd ? exec : dev;
const path = join(base, "database.json");

export async function initDatabase() {
	try {
		fs.accessSync(path);
	} catch {
		fs.writeFileSync(path, "{}\n", { encoding: "utf8" });
	}
}

export class Database {
	private locale: string;

	constructor(locale: string) {
		this.locale = locale;
	}

	// Get all translated keys and values
	static getAll(): DatabaseContent {
		const content = fs.readFileSync(path, { encoding: "utf8" });
		return Value.Parse(DatabaseSchema, JSON.parse(content));
	}

	// Get translated keys and values by locale
	get() {
		const all = Database.getAll();
		return all[`${this.locale}`] || {};
	}

	// Update translated key and values for locale
	update(translations: PostTranslation[]) {
		const modifiedTranslations = translations.map((tr) => ({
			...tr,
			value: tr.from,
		}));

		const all = Database.getAll();
		const target = all[`${this.locale}`] || {};

		const state = new State();

		const content = state.update({
			state: target,
			translations: modifiedTranslations,
		});

		set(all, `${this.locale}`, content);

		fs.writeFileSync(path, JSON.stringify(all, null, 2), {
			encoding: "utf8",
		});
	}
}
