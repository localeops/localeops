import get from "lodash/get";
import config from "../../../config";
import {
	type Delta,
	type I18nResource,
	State,
	type Translation,
} from "../../../core/state";
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

	private getFullFilePath(path: string) {
		return `${config.SOURCE_DIRECTORY}/${this.locale}/${path}`;
	}

	private async compileRemoteDir({
		branch,
		locale,
	}: {
		branch: string;
		locale: string;
	}): Promise<I18nResource> {
		const basePath = `${config.SOURCE_DIRECTORY}/${locale}`;

		const walk = async (path: string): Promise<I18nResource> => {
			const entries = (await github.readDir({ path, ref: branch })) as Array<{
				type: "dir" | "file";
				name: string;
				path: string;
			}>;
			const aggregated: Record<string, I18nResource> = {};

			for (const entry of entries) {
				if (entry.type === "dir") {
					const nested = await walk(entry.path);
					if (Object.keys(nested).length > 0) {
						aggregated[entry.name] = nested;
					}
				} else if (entry.type === "file" && entry.name.endsWith(".json")) {
					const file = await github.readFile({ path: entry.path, ref: branch });
					aggregated[entry.name] = file.content;
				}
			}

			return aggregated;
		};

		return await walk(basePath);
	}

	private async updateRemoteFiles(translations: Translation[]) {
		const filePathToTranslations = new Map<string, Translation[]>();

		for (const tr of translations) {
			const isStr = (s: unknown) => typeof s === "string";
			const idx = tr.path.findIndex((s) => isStr(s) && s.endsWith(".json"));
			if (idx < 0) throw new Error("No file in path");

			const filePath = tr.path.slice(0, idx + 1).join("/");
			const fullFilePath = this.getFullFilePath(filePath);

			const adjustedTranslation: Translation = {
				...tr,
				path: tr.path.slice(idx + 1),
			};

			const arr = filePathToTranslations.get(fullFilePath) ?? [];
			arr.push(adjustedTranslation);
			filePathToTranslations.set(fullFilePath, arr);
		}

		const state = new State();

		const branch = await github.upsertBranch(this.locale);

		for (const [path, translations] of filePathToTranslations) {
			const file = await github.readFile({ path, ref: branch });

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
				branch: branch,
				path: path,
				sha: file.sha,
				content: formattedContent,
			});
		}

		await github.updatePR({
			branch,
			locale: this.locale,
		});
	}

	async getUntranslatedDeltas(): Promise<Delta[]> {
		const database = new Database(this.locale);

		const translatedObj = await database.get();

		const sourceObj = await this.compileRemoteDir({
			branch: config.SOURCE_BRANCH,
			locale: config.SOURCE_LOCALE,
		});

		const diff = State.diffObjects({
			oldObj: translatedObj,
			newObj: sourceObj,
		});

		return diff;
	}

	async postTranslations(translations: PostTranslation[]) {
		const sourceCompilation = await this.compileRemoteDir({
			branch: config.SOURCE_BRANCH,
			locale: config.SOURCE_LOCALE,
		});

		// Check if translation is stale
		for (const translation of translations) {
			const { from, path } = translation;
			const source = get(sourceCompilation, path);

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

		await database.update(translations);
	}
}
