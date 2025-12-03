export const getTranslationBranchName = (locale: string) => {
	return `tr/${locale}`;
};

export function runCommand(
	command: string[],
	options: { stdio: "inherit" | "ignore" } = { stdio: "inherit" },
): void {
	const result = Bun.spawnSync(command, {
		stdout: options.stdio === "inherit" ? "inherit" : "ignore",
		stderr: options.stdio === "inherit" ? "inherit" : "ignore",
		stdin: "inherit",
	});

	if (!result.success) {
		throw new Error(`Command failed: ${command.join(" ")}`);
	}
}
