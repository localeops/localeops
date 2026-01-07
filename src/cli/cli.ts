import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import {
	initDatabase,
	initFramework,
	initSource,
	initTargetLocales,
} from "../config/config";
import { handleCliError } from "../core/error-handler";
import { ApplyCommand } from "./commands/apply.command";
import { ExtractCommand } from "./commands/extract.command";
import { SyncCommand } from "./commands/sync.command";

export class CLI {
	async run(): Promise<void> {
		await yargs(hideBin(process.argv))
			.command(
				"extract",
				"Return untranslated strings for configured locales",
				{},
				async () => {
					try {
						const source = initSource();

						const framework = initFramework();

						const database = await initDatabase();

						const targetLocales = initTargetLocales();

						const extractCommand = new ExtractCommand({
							source,
							database,
							framework,
						});

						const diffs = await extractCommand.execute(targetLocales);

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
						const source = initSource();

						const framework = initFramework();

						const database = await initDatabase();

						const applyCommand = new ApplyCommand({
							source,
							database,
							framework,
						});

						await applyCommand.execute(argv["translations-json"]);
					} catch (err) {
						handleCliError(err);
					}
				},
			)
			.command(
				"sync",
				"Make snapshots for configured target locales",
				{},
				async () => {
					try {
						const framework = initFramework();

						const database = await initDatabase();

						const targetLocales = initTargetLocales();

						const syncCommand = new SyncCommand({
							database,
							framework,
						});

						await syncCommand.execute(targetLocales);
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
