import lodash from "lodash";
import {
	SOURCE_BRANCH,
	SOURCE_DIRECTORY,
	SOURCE_FILE,
	SOURCE_LOCALE,
} from "../../../config";
import { type Delta, State, type Translation } from "../../../core/state";
import database from "../../database";
import { formatContent, inferFormatting } from "../../utils/formatting";
import github from "../../utils/github";
import type { PostTranslation } from "./translation.types";

const getLocaleFilePath = (locale: string) => {
	return `${SOURCE_DIRECTORY}/${locale}/${SOURCE_FILE}`;
};

const getLocaleFile = async (locale: string) => {
	const path = getLocaleFilePath(locale);
	const branch = SOURCE_BRANCH;
	const file = await github.readFile({ path, ref: branch });
	return file;
};

const updateRemoteLocaleFile = async ({
	locale,
	translations,
}: {
	locale: string;
	translations: Translation[];
}) => {
	const branch = await github.upsertBranch(locale);

	const path = getLocaleFilePath(locale);

	const file = await github.readFile({
		path: path,
		ref: branch,
	});

	const state = new State();

	const content = state.update({
		state: file.content,
		translations,
	});

	const formatting = inferFormatting(file.raw);

	const formattedContent = formatContent({
		content,
		formatting,
	});

	await github.updateFile({
		branch,
		path: path,
		sha: file.sha,
		content: formattedContent,
	});

	await github.updatePR({ branch, locale });
};

export const getUntranslated = async (locale: string): Promise<Delta[]> => {
	const storedTranslations = await database.getStoredTranslations(locale);

	const sourceLocaleFile = await getLocaleFile(SOURCE_LOCALE);

	const sourceLocaleContent = sourceLocaleFile.content;

	const diff = State.diffObjects({
		oldObj: storedTranslations,
		newObj: sourceLocaleContent,
	});

	return diff;
};

export const postTranslations = async ({
	locale,
	translations,
}: {
	locale: string;
	translations: PostTranslation[];
}) => {
	const sourceLocaleFile = await getLocaleFile(SOURCE_LOCALE);

	// Check if translation is stale
	for (const translation of translations) {
		const { from, path } = translation;
		const source = lodash.get(sourceLocaleFile.content, path);

		if (from !== source) {
			return new Response("Stale translation", { status: 400 });
		}
	}

	// Make changes to the repo
	await updateRemoteLocaleFile({ locale, translations });

	// Update translations file
	await database.updateStoredTranslations({ locale, translations });

	return new Response("OK");
};
