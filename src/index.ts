import getUntranslated from "./get-untranslated";
import submitTranslations from "./submit-translations";

async function main() {
	const [, , command] = process.argv;

	try {
		if (command === "get-untranslated") {
			await getUntranslated();
		} else if (command === "submit-translations") {
			await submitTranslations();
		} else {
			console.error(
				`Usage: $0 <command>\nCommands:\n  get-untranslated\n  submit-translations`,
			);

			process.exit(1);
		}
	} catch (err) {
		console.error("Error:", err instanceof Error ? err.message : err);

		process.exit(1);
	}
}

main();
