import { Value } from "@sinclair/typebox/value";
import type { BaseDatabase } from "../../databases";
import type { BaseFramework } from "../../framework/base/base.framework";
import { SnapshotSchema } from "../../framework/base/base.schema";
import type { SnapshotDelta } from "../../framework/base/base.types";
import { logger } from "../../shared/logger";
import { getTranslationBranchName } from "../../shared/utils";
import type { BaseSource } from "../../sources";

export class ExtractCommand {
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

	async execute(locales: string[]): Promise<Record<string, SnapshotDelta[]>> {
		const diffs: Record<string, SnapshotDelta[]> = {};

		for (const locale of locales) {
			const diff = await this.extract(locale);
			diffs[locale] = diff;
		}

		return diffs;
	}

	async extract(locale: string): Promise<SnapshotDelta[]> {
		const { source, database, framework } = this;

		const localeBranchName = getTranslationBranchName(locale);

		source.checkout(localeBranchName);

		const oldSnapshot = await database.get(locale);

		const oldSnapshotParsed = oldSnapshot
			? Value.Parse(SnapshotSchema, JSON.parse(oldSnapshot))
			: {};

		logger.debug("Old snapshot", oldSnapshotParsed);

		source.checkout(source.baseBranch);

		const newSnapshot = framework.snapshot();

		logger.debug("New snapshot", newSnapshot);

		const diff = framework.diffSnapshots({
			newSnapshot,
			oldSnapshot: oldSnapshotParsed,
		});

		logger.debug("Snapshot diff", diff);

		return diff;
	}
}
