export const interpolateEnvVars = (input: string): string => {
	const missingVars: string[] = [];

	const result = input.replace(
		// Replace ${VAR} with env values, but skip lines starting with #
		// (?<=^[^#\n]*) - lookbehind: only match if line doesn't start with #
		// ${([^}]+)} - capture variable name inside ${}
		/(?<=^[^#\n]*)(\$\{([^}]+)\})/gm,
		(match, _, varName) => {
			const trimmedVar = varName.trim();
			const value = process.env[trimmedVar];

			if (value === undefined) {
				missingVars.push(trimmedVar);
				return match;
			}

			return value;
		},
	);

	if (missingVars.length > 0) {
		throw new Error(
			`Missing environment variables: ${missingVars.join(", ")}\n` +
				`Please set: ${missingVars.map((v) => `export ${v}=value`).join("; ")}`,
		);
	}

	return result;
};
