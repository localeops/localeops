import type { LocaleOpsOrchestrator } from "../../core/orchestrator";
import type { SnapshotDelta } from "../../framework/base/base.types";

export class ExtractCommand {
	constructor(private orchestrator: LocaleOpsOrchestrator) {}

	async execute(locales: string[]): Promise<Record<string, SnapshotDelta[]>> {
		const diffs: Record<string, SnapshotDelta[]> = {};

		for (const locale of locales) {
			const diff = await this.orchestrator.extract(locale);
			diffs[locale] = diff;
		}

		return diffs;
	}
}
