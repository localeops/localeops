import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { config } from "../config";
import { LocaleOpsContext } from "../core/context";
import { LocaleOpsOrchestrator } from "../core/orchestrator";
import { logger } from "../shared/logger";
import { ApplyCommand } from "./commands/apply.command";
import { ExtractCommand } from "./commands/extract.command";

export class CLI {
	private orchestratorPromise: Promise<LocaleOpsOrchestrator>;

	constructor() {
		this.orchestratorPromise = this.initOrchestrator();
	}

	private async initOrchestrator(): Promise<LocaleOpsOrchestrator> {
		const ctx = await LocaleOpsContext.create(config);
		return new LocaleOpsOrchestrator(ctx);
	}

	async run(): Promise<void> {
		const orchestrator = await this.orchestratorPromise;

		await yargs(hideBin(process.argv))
			.command(
				"extract",
				"Return untranslated strings for configured locales",
				{},
				async () => {
					try {
						const extractCommand = new ExtractCommand(orchestrator);
						const diffs = await extractCommand.execute(config.locales);
						// Output results to stdout for consumption by translation services
						console.log(JSON.stringify(diffs, null, 2));
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
						const applyCommand = new ApplyCommand(orchestrator);
						await applyCommand.execute(argv.locale, argv["translations-json"]);
					} catch (err) {
						logger.error(err instanceof Error ? err.message : "Unknown", err);
						process.exit(1);
					}
				},
			)
			.demandCommand(1, "You must provide a command")
			.help()
			.strict()
			.parseAsync();
	}
}
