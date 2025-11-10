import { Value } from "@sinclair/typebox/value";
import get from "lodash/get";
import { config } from "../../../config";
import {
	type Delta,
	type I18nResource,
	State,
	type Translation,
} from "../../../core/state";
import { i18nResource } from "../../../core/state/state.schema";
import type { BaseDatabase } from "../../../databases";
import { createDatabase } from "../../../databases";
import { createSource } from "../../../sources/factory";
import { AppError, ERROR_TYPES } from "../../utils/errors";
import { formatContent, inferFormatting } from "../../utils/formatting";
import type { PostTranslation } from "./translation.types";

const source = await createSource(config.source);
const database = await createDatabase(config.database);
await database.initialize();

export class TranslationService {
	locale: string;
	private database: BaseDatabase;

	constructor(locale: string) {
		this.locale = locale;
		this.database = database;
	}

	async getUntranslatedDeltas(): Promise<Delta[]> {
		let sourceSnapshot = await this.database.get(this.locale);

		if (sourceSnapshot === null) {
			sourceSnapshot = JSON.stringify({});
		}

		const sourceSnapshotObj = Value.Parse(
			i18nResource,
			JSON.parse(sourceSnapshot),
		);

		const baseLocaleDirCompilation = await this.compileBaseLocaleDir();

		const diff = State.diffObjects({
			oldObj: sourceSnapshotObj,
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

		// Update translation progress tracker with source language snapshot
		await this.updateTranslationProgress(translations);
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

		await source.ensureBranch({
			name: translationsBranch,
			base: config.source.branch,
		});

		for (const [path, translations] of filePathToTranslations) {
			const file = await source.getFile({ path, branch: translationsBranch });

			const validatedContent = Value.Parse(
				i18nResource,
				file.content as unknown,
			);

			const content = state.update({
				state: validatedContent,
				translations,
			});

			const formatting = inferFormatting(file.raw);

			const formattedContent = formatContent({
				content,
				formatting,
			});

			const commitMessage = this.getCommitMessage(path);

			await source.commitFile({
				path: path,
				sha: file.sha,
				message: commitMessage,
				content: formattedContent,
				branch: translationsBranch,
			});
		}

		const title = this.getPullRequestName();

		const body = this.getPullRequestBody();

		await source.ensurePullRequest({
			body,
			title,
			branch: translationsBranch,
			base: config.source.branch,
		});
	}

	private async compileBaseLocaleDir(): Promise<I18nResource> {
		const baseLocaleDirPath = `${config.source.directory}/${config.source.locale}`;

		const walk = async (dirPath: string): Promise<I18nResource> => {
			const entries = await source.getDirectory({
				path: dirPath,
				branch: config.source.branch,
			});

			const aggregated: Record<string, I18nResource> = {};

			for (const entry of entries) {
				if (entry.type === "dir") {
					const nested = await walk(entry.path);

					if (Object.keys(nested).length > 0) {
						aggregated[entry.name] = nested;
					}
				} else if (entry.type === "file" && entry.name.endsWith(".json")) {
					const file = await source.getFile({
						path: entry.path,
						branch: config.source.branch,
					});

					const validatedContent = Value.Parse(
						i18nResource,
						file.content as unknown,
					);
					aggregated[entry.name] = validatedContent;
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

	private async updateTranslationProgress(translations: PostTranslation[]) {
		// Store source language text (from) to track what version was translated
		const sourceTextSnapshots = translations.map((tr) => ({
			...tr,
			value: tr.from,
		}));

		// Get existing source snapshot for this target locale
		let existingSnapshot = await this.database.get(this.locale);

		if (existingSnapshot === null) {
			existingSnapshot = JSON.stringify({});
		}

		const target = Value.Parse(i18nResource, JSON.parse(existingSnapshot));

		// Merge source text snapshots with existing tracked keys
		const state = new State();
		const updatedSnapshot = state.update({
			state: target,
			translations: sourceTextSnapshots,
		});

		// Save updated source snapshot back to progress tracker
		await this.database.set(this.locale, JSON.stringify(updatedSnapshot));
	}
}
