import { Value } from "@sinclair/typebox/value";

import { config } from "./config";
import { createDatabase } from "./databases/factory";
import { SnapshotSchema } from "./framework/base/base.schema";
import type { SnapshotDelta } from "./framework/base/base.types";
import { createFramework } from "./framework/factory";
import { logger } from "./shared/logger";
import { getTranslationBranchName } from "./shared/utils";
import { createSource } from "./sources/factory";

export async function extract(params: {
	locale: string;
}): Promise<SnapshotDelta[]> {
	const { locale } = params;

	const source = createSource(config.source);

	const framework = createFramework(config.framework);

	const database = await createDatabase(config.database);

	await database.initialize();

	try {
		const localeBranchName = getTranslationBranchName(locale);
		source.checkout(localeBranchName);

		const oldSnapshot = await database.get(locale);
		const oldSnapshotParsed = oldSnapshot
			? Value.Parse(SnapshotSchema, JSON.parse(oldSnapshot))
			: {};

		logger.debug("Old snapshot", oldSnapshotParsed);

		source.checkout(config.source.base);
		const newSnapshot = framework.snapshotSourceLocaleDir();

		logger.debug("New snapshot", newSnapshot);

		const diff = framework.diffSnapshots({
			newSnapshot,
			oldSnapshot: oldSnapshotParsed,
		});

		logger.debug("Snapshot diff", diff);

		return diff;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(`Error extracting untranslated\n${message}`);
	}
}
