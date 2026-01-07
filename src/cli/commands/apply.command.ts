import fs from "node:fs";
import path from "node:path";
import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { type Translation, TranslationSchema } from "../../core/types";
import type { BaseDatabase } from "../../databases";
import type { BaseFramework } from "../../framework/base/base.framework";
import { SnapshotSchema } from "../../framework/base/base.schema";
import { logger } from "../../shared/logger";
import { getTranslationBranchName } from "../../shared/utils";
import type { BaseSource } from "../../sources";

export class ApplyCommand {
	readonly source: BaseSource;

	readonly database: BaseDatabase;

	readonly framework: BaseFramework<unknown>;

	constructor(params: {
		source: BaseSource;
		database: BaseDatabase;
		framework: BaseFramework<unknown>;
	}) {
		this.source = params.source;
		this.database = params.database;
		this.framework = params.framework;
	}

	async execute(translationsJson: string): Promise<void> {
		const ApplyPayloadSchema = Type.Record(
			Type.String(),
			Type.Array(TranslationSchema),
		);

		let translations: unknown;
		try {
			translations = JSON.parse(translationsJson);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			throw new Error(`Failed to parse translations JSON: ${message}`, {
				cause: error,
			});
		}

		const validated = Value.Parse(ApplyPayloadSchema, translations);

		await this.apply(validated);
	}

	async apply(allTranslations: Record<string, Translation[]>): Promise<void> {
		const { source, framework } = this;

		source.checkout(source.baseBranch);

		const currentSnapshot = framework.snapshot();

		logger.debug("Current snapshot: ", currentSnapshot);

		for (const [locale, translations] of Object.entries(allTranslations)) {
			if (translations.length === 0) {
				continue;
			}

			// Check if any translation is stale
			for (const translation of translations) {
				const { from, filePath, resourcePath } = translation;

				const resource = currentSnapshot[filePath];

				const current = framework.resolve({
					resource,
					resourcePath,
				});

				if (from !== current) {
					throw new Error(
						`Translation for ${filePath}:${resourcePath} is stale. From: ${from}, Current: ${current}\nPlease re-extract translations to get current source locale values.`,
					);
				}
			}

			await this.updateTargetResourceFiles(translations, locale);

			await this.updateSourceLocaleDirSnapshot(translations, locale);
		}
	}

	private async updateTargetResourceFiles(
		translations: Translation[],
		locale: string,
	): Promise<void> {
		const { framework, source } = this;

		logger.debug("Updating target resource files...");

		const fullFilePathToTranslations = new Map<string, Translation[]>();

		for (const tr of translations) {
			const { filePath } = tr;

			const fullFilePath = framework.resolveFilePath({
				locale,
				filePath,
			});

			const arr = fullFilePathToTranslations.get(fullFilePath) ?? [];
			arr.push(tr);
			fullFilePathToTranslations.set(fullFilePath, arr);
		}

		const translationsBranch = getTranslationBranchName(locale);

		source.checkout(translationsBranch);

		for (const [fullFilePath, translations] of fullFilePathToTranslations) {
			let content: string;

			if (fs.existsSync(fullFilePath)) {
				const raw = fs.readFileSync(fullFilePath, { encoding: "utf8" });
				const resource = framework.deserialize(raw);
				const updatedResource = framework.patch({
					resource: resource,
					updates: translations,
				});
				content = framework.serialize(updatedResource);
			} else {
				const updatedResource = framework.patch({
					updates: translations,
				});
				content = framework.serialize(updatedResource);
			}

			fs.mkdirSync(path.dirname(fullFilePath), { recursive: true });
			fs.writeFileSync(fullFilePath, content, { encoding: "utf8" });

			const commitMessage = `chore(i18n): update translations for ${locale}`;
			source.commitFile({ path: fullFilePath, message: commitMessage });
		}

		source.push(translationsBranch);

		const title = `LocaleOps: update translations for ${locale}`;
		const description = `This PR updates translation files for locale: ${locale}`;

		await source.ensurePullRequest({
			description,
			title,
			branch: translationsBranch,
		});
	}

	private async updateSourceLocaleDirSnapshot(
		translations: Translation[],
		locale: string,
	): Promise<void> {
		const { framework, database, source } = this;

		logger.debug("Updating source locale directory snapshot...");

		// Store source language text (from) to track what version was translated
		const snapshotUpdates = translations.map((tr) => ({
			...tr,
			value: tr.from,
		}));

		// Get existing source snapshot for this target locale
		let snapshot = await database.get(locale);

		if (snapshot === null) {
			snapshot = JSON.stringify({});
		}

		const snapshotParsed = Value.Parse(SnapshotSchema, JSON.parse(snapshot));

		for (const update of snapshotUpdates) {
			const resource = snapshotParsed[update.filePath];

			const updatedResource = framework.patch({
				resource,
				updates: [update],
			});

			logger.debug("Updated resource: ", updatedResource);

			snapshotParsed[update.filePath] = updatedResource;
		}

		logger.debug("Updated snapshot: ", snapshotParsed);

		// Save updated source snapshot back to progress tracker
		await database.set({
			key: locale,
			content: JSON.stringify(snapshotParsed),
			source,
		});

		const translationsBranch = getTranslationBranchName(locale);

		source.push(translationsBranch);
	}
}
