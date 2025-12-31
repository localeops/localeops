import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { config } from "../config";
import { LocaleOpsContext } from "../core/context";
import { handleCliError } from "../core/error-handler";
import { LocaleOpsOrchestrator } from "../core/orchestrator";
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
						const diffs = await extractCommand.execute(config.targetLocales);
						// Output results to stdout for consumption by translation services
						console.log(JSON.stringify(diffs, null, 2));
					} catch (err) {
						handleCliError(err);
					}
				},
			)
			.command(
				"apply <translations-json>",
				"Apply translations and create pull requests",
				(yargs) => {
					return yargs.positional("translations-json", {
						type: "string",
						demandOption: true,
						describe:
							"JSON object string with keys as locales and values as translations",
					});
				},
				async (argv) => {
					try {
						const applyCommand = new ApplyCommand(orchestrator);
						await applyCommand.execute(argv["translations-json"]);
					} catch (err) {
						handleCliError(err);
					}
				},
			)
			.demandCommand(1, "You must provide a command")
			.help()
			.strict()
			.parseAsync();
	}
}
