import fs from "node:fs";
import path from "node:path";
import { Value } from "@sinclair/typebox/value";
import { SnapshotSchema } from "../framework/base/base.schema";
import type { Snapshot, SnapshotDelta } from "../framework/base/base.types";
import { logger } from "../shared/logger";
import { getTranslationBranchName } from "../shared/utils";
import type { LocaleOpsContext } from "./context";
import type { Translation } from "./types";

export class LocaleOpsOrchestrator {
	constructor(private ctx: LocaleOpsContext) {}

	async extract(locale: string): Promise<SnapshotDelta[]> {
		const { framework, database, source, config } = this.ctx;

		const localeBranchName = getTranslationBranchName(locale);

		source.checkout(localeBranchName);

		const oldSnapshot = await database.get(locale);

		const oldSnapshotParsed = oldSnapshot
			? Value.Parse(SnapshotSchema, JSON.parse(oldSnapshot))
			: {};

		logger.debug("Old snapshot", oldSnapshotParsed);

		source.checkout(config.source.base);

		const newSnapshot = framework.snapshot();

		logger.debug("New snapshot", newSnapshot);

		const diff = framework.diffSnapshots({
			newSnapshot,
			oldSnapshot: oldSnapshotParsed,
		});

		logger.debug("Snapshot diff", diff);

		return diff;
	}

	async sync(locale: string): Promise<void> {
		const { framework, database } = this.ctx;

		const targetSnapshot: Snapshot<unknown> = {};

		const targetLocaleDiff = framework.diffSnapshots({
			newSnapshot: framework.snapshot(locale),
			oldSnapshot: targetSnapshot,
		});

		const targetLocaleAddedDiff = targetLocaleDiff.filter((d) => {
			return d.type === "added";
		});

		const sourceSnapshot = framework.snapshot();

		for (const delta of targetLocaleAddedDiff) {
			if (sourceSnapshot[delta.filePath]) {
				const value = framework.resolve({
					resource: sourceSnapshot[delta.filePath],
					resourcePath: delta.resourcePath,
				});

				delta.value = value;

				const resource = framework.patch({
					resource: targetSnapshot[delta.filePath],
					updates: [delta],
				});

				targetSnapshot[delta.filePath] = resource;
			}
		}

		await database.set({
			key: locale,
			content: JSON.stringify(targetSnapshot),
			commit: false,
		});
	}

	async apply(allTranslations: Record<string, Translation[]>): Promise<void> {
		const { framework, source, config } = this.ctx;

		source.checkout(config.source.base);

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
		const { framework, source } = this.ctx;

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
		const { framework, database, source } = this.ctx;

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
			commit: true,
		});

		const translationsBranch = getTranslationBranchName(locale);

		source.push(translationsBranch);
	}
}
