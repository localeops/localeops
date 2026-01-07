import type { BaseDatabase } from "../../databases";
import type { BaseFramework } from "../../framework/base/base.framework";
import type { Snapshot } from "../../framework/base/base.types";

export class SyncCommand {
	readonly database: BaseDatabase;

	readonly framework: BaseFramework<unknown>;

	constructor(params: {
		database: BaseDatabase;
		framework: BaseFramework<unknown>;
	}) {
		this.database = params.database;
		this.framework = params.framework;
	}

	async execute(locales: string[]): Promise<void> {
		for (const locale of locales) {
			await this.sync(locale);
		}
	}

	async sync(locale: string): Promise<void> {
		const { database, framework } = this;

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
		});
	}
}
