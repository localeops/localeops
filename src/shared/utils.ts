export const getTranslationBranchName = (locale: string) => {
	return `tr/${locale}`;
};

export function runCommand(command: string[]): void {
	const result = Bun.spawnSync(command, {
		stdout: "ignore",
		stderr: "inherit",
		stdin: "inherit",
	});

	if (!result.success) {
		throw new Error(`Command failed: ${command.join(" ")}`);
	}
}
