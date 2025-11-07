import get from "lodash/get";
import { config } from "../../../config";
import {
	type Delta,
	type I18nResource,
	State,
	type Translation,
} from "../../../core/state";
import { createSource } from "../../../sources/factory";
import { Database } from "../../database/database";
import { AppError, ERROR_TYPES } from "../../utils/errors";
import { formatContent, inferFormatting } from "../../utils/formatting";
import type { PostTranslation } from "./translation.types";

const source = await createSource(config.source);

export class TranslationService {
	locale: string;

	constructor(locale: string) {
		this.locale = locale;
	}

	async getUntranslatedDeltas(): Promise<Delta[]> {
		const database = new Database(this.locale);

		const translatedObj = database.get();

		const baseLocaleDirCompilation = await this.compileBaseLocaleDir();

		const diff = State.diffObjects({
			oldObj: translatedObj,
			newObj: baseLocaleDirCompilation,
		});

		return diff;
	}

	async postTranslations(translations: PostTranslation[]) {
		const baseLocaleDirCompilation = await this.compileBaseLocaleDir();

		// Check if translation is stale
		for (const translation of translations) {
			const { from, path } = translation;
			const source = get(baseLocaleDirCompilation, path);

			if (from !== source) {
				throw new AppError({
					type: ERROR_TYPES.STALE_TRANSLATION,
					message: `Translation for ${path} is stale. From: ${from}, Current: ${source}`,
				});
			}
		}

		// Make changes to the repo
		await this.updateRemoteFiles(translations);

		// Update translations file
		const database = new Database(this.locale);

		database.update(translations);
	}

	private async updateRemoteFiles(translations: Translation[]) {
		const filePathToTranslations = new Map<string, Translation[]>();

		for (const tr of translations) {
			const isStr = (s: unknown) => typeof s === "string";

			const idx = tr.path.findIndex((s) => isStr(s) && s.endsWith(".json"));

			if (idx < 0) throw new Error("No file in path");

			const filePath = tr.path.slice(0, idx + 1).join("/");

			const fullFilePath = this.getFullFilePath({
				path: filePath,
				locale: this.locale,
			});

			const adjustedTranslation: Translation = {
				...tr,
				path: tr.path.slice(idx + 1),
			};

			const arr = filePathToTranslations.get(fullFilePath) ?? [];

			arr.push(adjustedTranslation);

			filePathToTranslations.set(fullFilePath, arr);
		}

		const state = new State();

		const translationsBranch = this.getTranslationBranchName();

		await source.upsertBranchFromBase({
			branchName: translationsBranch,
			baseBranch: config.source.branch,
		});

		for (const [path, translations] of filePathToTranslations) {
			const file = await source.readFile({ path, ref: translationsBranch });

			const content = state.update({
				state: file.content,
				translations,
			});

			const formatting = inferFormatting(file.raw);

			const formattedContent = formatContent({
				content,
				formatting,
			});

			const commitMessage = this.getCommitMessage(path);

			await source.updateFile({
				path: path,
				commitMessage,
				content: formattedContent,
				identifier: file.identifier,
				branch: translationsBranch,
			});
		}

		const title = this.getPullRequestName();

		const body = this.getPullRequestBody();

		await source.updatePR({
			body,
			title,
			branch: translationsBranch,
			base: config.source.branch,
		});
	}

	private async compileBaseLocaleDir(): Promise<I18nResource> {
		const baseLocaleDirPath = `${config.source.directory}/${config.source.locale}`;

		const walk = async (dirPath: string): Promise<I18nResource> => {
			const entries = await source.readDir({
				path: dirPath,
				ref: config.source.branch,
			});

			const aggregated: Record<string, I18nResource> = {};

			for (const entry of entries) {
				if (entry.type === "dir") {
					const nested = await walk(entry.path);

					if (Object.keys(nested).length > 0) {
						aggregated[entry.name] = nested;
					}
				} else if (entry.type === "file" && entry.name.endsWith(".json")) {
					const file = await source.readFile({
						path: entry.path,
						ref: config.source.branch,
					});

					aggregated[entry.name] = file.content;
				}
			}

			return aggregated;
		};

		return await walk(baseLocaleDirPath);
	}

	private getPullRequestName() {
		return `TR/${this.locale}`;
	}

	private getTranslationBranchName() {
		return `tr/${this.locale}`;
	}

	private getPullRequestBody() {
		return `Translations for ${this.locale} locale.\nThis PR was automatically created.\nDo not edit PR manually`;
	}

	private getCommitMessage(path: string) {
		return `update for ${path}`;
	}

	private getFullFilePath({ path, locale }: { path: string; locale: string }) {
		return `${config.source.directory}/${locale}/${path}`;
	}
}
