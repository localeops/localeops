export const interpolateEnvVars = (input: string): string => {
	const missingVars: string[] = [];

	const result = input.replace(/\$\{([^}]+)\}/g, (match, varName) => {
		const value = process.env[varName.trim()];
		if (value === undefined) {
			missingVars.push(varName.trim());
			return match;
		}
		return value;
	});

	if (missingVars.length > 0) {
		throw new Error(
			`Missing environment variables: ${missingVars.join(", ")}\n` +
				`Please set: ${missingVars.map((v) => `export ${v}=value`).join("; ")}`,
		);
	}

	return result;
};
