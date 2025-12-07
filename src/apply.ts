import fs from "node:fs";
import path from "node:path";
import type { Static } from "@sinclair/typebox";
import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { config } from "./config";
import { createDatabase } from "./databases";
import { SnapshotSchema, UpdateSchema } from "./framework/base/base.schema";
import { createFramework } from "./framework/factory";
import { formatContent, inferFormatting } from "./shared/formatting";
import { logger } from "./shared/logger";
import { getTranslationBranchName } from "./shared/utils";
import { createSource } from "./sources/factory";

const source = createSource(config.source);

const database = await createDatabase(config.database);

const framework = createFramework(config.framework);

await database.initialize();

export const SubmitTranslationSchema = Type.Intersect([
	UpdateSchema,
	Type.Object({
		from: Type.String(),
	}),
]);

type Translation = Static<typeof UpdateSchema>;

type SubmitTranslation = Static<typeof SubmitTranslationSchema>;

const updateTargetResourceFiles = async (
	translations: Translation[],
	locale: string,
) => {
	logger.debug("Updating target resource files...");

	const fullFilePathToTranslations = new Map<string, Translation[]>();

	for (const tr of translations) {
		const { filePath } = tr;

		const fullFilePath = framework.getFullFilePath({
			filePath: filePath,
			locale: locale,
		});

		const arr = fullFilePathToTranslations.get(fullFilePath) ?? [];

		arr.push(tr);

		fullFilePathToTranslations.set(fullFilePath, arr);
	}

	const translationsBranch = getTranslationBranchName(locale);

	source.checkout(translationsBranch);

	for (const [fullFilePath, translations] of fullFilePathToTranslations) {
		const { resource, raw } = framework.readResourceFile(fullFilePath);

		const content = framework.updateValuesInResource({
			resource,
			updates: translations,
		});

		let formattedContent = JSON.stringify(content, null, 2);

		if (raw) {
			const formatting = inferFormatting(raw);

			formattedContent = formatContent({
				content,
				formatting,
			});
		}

		fs.mkdirSync(path.dirname(fullFilePath), { recursive: true });

		fs.writeFileSync(fullFilePath, formattedContent, "utf-8");

		const commitMessage = `chore(i18n): update translations for ${locale}`;

		source.commitFile({ path: fullFilePath, message: commitMessage });
	}

	source.push(translationsBranch);

	const title = `Update translations for ${locale}`;

	const description = `This PR updates translation files for locale: ${locale}`;

	source.ensurePullRequest({
		description,
		title,
		branch: translationsBranch,
	});
};

// TODO: group updates by source files
const updateSourceLocaleDirSnapshot = async (
	translations: SubmitTranslation[],
	locale: string,
) => {
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

		const updatedResource = framework.updateValuesInResource({
			resource,
			updates: [update],
		});

		logger.debug("Updated resource: ", updatedResource);

		snapshotParsed[update.filePath] = updatedResource;
	}

	logger.debug("Updated snapshot: ", snapshotParsed);

	// Save updated source snapshot back to progress tracker
	await database.set(locale, JSON.stringify(snapshotParsed));

	const translationsBranch = getTranslationBranchName(locale);

	source.push(translationsBranch);
};

const submitTranslations = async ({
	locale,
	translations,
}: {
	locale: string;
	translations: SubmitTranslation[];
}) => {
	if (translations.length === 0) {
		return;
	}

	source.checkout(config.source.base);

	const currentSnapshot = framework.snapshotSourceLocaleDir();

	logger.debug("Current snapshot: ", currentSnapshot);

	// Check if translations are stale
	for (const translation of translations) {
		const { from, filePath, resourcePath } = translation;

		const resource = currentSnapshot[filePath];

		const current = framework.getValueFromResource({
			resource,
			resourcePath,
		});

		if (from !== current) {
			throw new Error(
				`Translation for ${filePath}:${resourcePath} is stale. From: ${from}, Current: ${current}`,
			);
		}
	}

	await updateTargetResourceFiles(translations, locale);

	await updateSourceLocaleDirSnapshot(translations, locale);
};

export default submitTranslations;
