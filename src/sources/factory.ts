import type { SourceConfig } from "../config/config";
import { SourceError } from "../core/errors";
import type { BaseSource } from "./base.source";
import { GitHubSource } from "./github/github.source";

export const createSource = (config: SourceConfig): BaseSource => {
	const name = config.name;

	if (name === "github") {
		return new GitHubSource(config);
	}

	const _exhaustive: never = name;

	throw new SourceError(
		`Unknown source adapter: ${(_exhaustive as { name: string }).name}\nPlease check configuration file.`,
	);
};
