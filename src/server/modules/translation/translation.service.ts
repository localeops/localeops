import get from "lodash/get";
import config from "../../../config";
import { type Delta, State, type Translation } from "../../../core/state";
import { Database } from "../../database/database";
import { AppError, ERROR_TYPES } from "../../utils/errors";
import { formatContent, inferFormatting } from "../../utils/formatting";
import github from "../../utils/github";
import type { PostTranslation } from "./translation.types";

export class TranslationService {
	locale: string;

	constructor(locale: string) {
		this.locale = locale;
	}

	private static getRemoteFilePath(locale: string) {
		return `${config.SOURCE_DIRECTORY}/${locale}/${config.SOURCE_FILE}`;
	}

	private static async getRemoteFile({
		locale,
		branch,
	}: {
		locale: string;
		branch: string;
	}) {
		const path = TranslationService.getRemoteFilePath(locale);
		const file = await github.readFile({ path, ref: branch });
		return file;
	}

	private async updateRemoteFile(translations: Translation[]) {
		const branch = await github.upsertBranch(this.locale);
		const path = TranslationService.getRemoteFilePath(this.locale);

		const file = await TranslationService.getRemoteFile({
			branch,
			locale: this.locale,
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

		await github.updatePR({
			branch,
			locale: this.locale,
		});
	}

	async getUntranslated(): Promise<Delta[]> {
		const database = new Database(this.locale);

		const translated = await database.get();

		const sourceFile = await TranslationService.getRemoteFile({
			branch: config.SOURCE_BRANCH,
			locale: config.SOURCE_LOCALE,
		});

		const sourceFileContent = sourceFile.content;

		const diff = State.diffObjects({
			oldObj: translated,
			newObj: sourceFileContent,
		});

		return diff;
	}

	async postTranslations(translations: PostTranslation[]) {
		const sourceFile = await TranslationService.getRemoteFile({
			branch: config.SOURCE_BRANCH,
			locale: config.SOURCE_LOCALE,
		});

		// Check if translation is stale
		for (const translation of translations) {
			const { from, path } = translation;
			const source = get(sourceFile.content, path);

			if (from !== source) {
				throw new AppError({
					type: ERROR_TYPES.STALE_TRANSLATION,
					message: `Translation for ${path} is stale. From: ${from}, Current: ${source}`,
				});
			}
		}

		// Make changes to the repo
		await this.updateRemoteFile(translations);

		// Update translations file
		const database = new Database(this.locale);
		await database.update(translations);
	}
}
