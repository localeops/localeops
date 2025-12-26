import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import type { LocaleOpsOrchestrator } from "../../core/orchestrator";
import { TranslationSchema } from "../../core/types";

export class ApplyCommand {
	constructor(private orchestrator: LocaleOpsOrchestrator) {}

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

		await this.orchestrator.apply(validated);
	}
}
