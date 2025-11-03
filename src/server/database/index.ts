import * as fs from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import lodash from "lodash";

import type { PostTranslation } from "../modules/translation/translation.types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const path = join(__dirname, "translations.json");

const getStoredTranslations = async (locale: string) => {
	const content = await fs.readFile(path, { encoding: "utf8" });
	const translations = JSON.parse(content)[`${locale}`];
	return translations || {};
};

const updateStoredTranslations = async ({
	locale,
	translations,
}: {
	locale: string;
	translations: PostTranslation[];
}) => {
	const content = await fs.readFile(path, { encoding: "utf8" });
	const allTranslations = JSON.parse(content);

	const localeTranslations = allTranslations[`${locale}`] || {};

	for (const translation of translations) {
		lodash.set(localeTranslations, translation.path, translation.from);
	}

	allTranslations[`${locale}`] = localeTranslations;

	await fs.writeFile(path, JSON.stringify(allTranslations, null, 2), {
		encoding: "utf8",
	});
};

export default {
	getStoredTranslations,
	updateStoredTranslations,
};
