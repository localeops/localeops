import type { Config } from "../config/config";
import type { BaseSource } from "./base.source";
import { GitHubSource } from "./github/github.source";

export const createSource = (config: Config["source"]): BaseSource => {
	const name = config.name;

	if (name === "github") {
		return new GitHubSource(config);
	}

	const _exhaustive: never = name;

	throw new Error(
		`Unknown source adapter: ${(_exhaustive as { name: string }).name}`,
	);
};
