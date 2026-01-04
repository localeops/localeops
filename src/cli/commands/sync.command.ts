import type { LocaleOpsOrchestrator } from "../../core/orchestrator";

export class SyncCommand {
	constructor(private orchestrator: LocaleOpsOrchestrator) {}

	async execute(locales: string[]): Promise<void> {
		for (const locale of locales) {
			await this.orchestrator.sync(locale);
		}
	}
}
