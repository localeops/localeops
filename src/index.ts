import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import submitTranslations, { SubmitTranslationSchema } from "./apply";
import { config } from "./config";
import { extract } from "./extract";
import type { SnapshotDelta } from "./framework/base/base.types";
import { logger } from "./shared/logger";

yargs(hideBin(process.argv))
	.command(
		"extract",
		"Return untranslated strings for configured locales",
		{},
		async () => {
			try {
				const locales = config.locales;

				await handleExtract(locales);
			} catch (err) {
				logger.error(err instanceof Error ? err.message : "Unknown", err);
				process.exit(1);
			}
		},
	)
	.command(
		"apply <locale> <translations-json>",
		"Apply translations and create pull request",
		(yargs) => {
			return yargs
				.positional("locale", {
					type: "string",
					demandOption: true,
					describe: "Target locale to apply translations to",
				})
				.positional("translations-json", {
					type: "string",
					demandOption: true,
					describe: "JSON string containing translations",
				});
		},
		async (argv) => {
			try {
				await handleApply(argv.locale, argv["translations-json"]);
			} catch (err) {
				logger.error(err instanceof Error ? err.message : "Unknown", err);
				process.exit(1);
			}
		},
	)
	.demandCommand(1, "You must provide a command")
	.help()
	.strict()
	.parse();

async function handleExtract(locales: string[]) {
	const diffs: Record<string, SnapshotDelta[]> = {};

	for (const locale of locales) {
		const diff = await extract({ locale });
		diffs[locale] = diff;
	}

	logger.debug("Extracted diffs:", diffs);

	console.log(JSON.stringify(diffs, null, 2));

	return diffs;
}

async function handleApply(locale: string, translationsJson: string) {
	const ApplyPayloadSchema = Type.Object({
		locale: Type.String(),
		translations: Type.Array(SubmitTranslationSchema),
	});

	const translations = JSON.parse(translationsJson);

	const validated = Value.Parse(ApplyPayloadSchema, {
		locale,
		translations,
	});

	await submitTranslations(validated);
}
