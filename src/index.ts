import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { extract } from "./extract";
import { logger } from "./shared/logger";
import submitTranslations, {
	SubmitTranslationSchema,
} from "./submit-translations";

yargs(hideBin(process.argv))
	.command(
		"extract <locale> <callback-url>",
		"Extract untranslated strings and send to callback URL",
		(yargs) => {
			return yargs
				.positional("locale", {
					type: "string",
					demandOption: true,
					describe: "Target locale to extract translations for",
				})
				.positional("callback-url", {
					type: "string",
					demandOption: true,
					describe: "URL to send the extracted translations to",
				});
		},
		async (argv) => {
			try {
				await handleExtract(argv.locale, argv["callback-url"]);
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

async function handleExtract(locale: string, callbackUrl: string) {
	const ExtractPayloadSchema = Type.Object({
		locale: Type.String(),
		callbackUrl: Type.String(),
	});

	const validated = Value.Parse(ExtractPayloadSchema, {
		locale,
		callbackUrl,
	});

	await extract(validated);
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
