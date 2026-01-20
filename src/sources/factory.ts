import type { SourceConfig } from "../config/config";
import { SourceError } from "../core/errors";
import type { BaseSource } from "./base.source";
import { BitbucketSource } from "./bitbucket/bitbucket.source";
import { GitHubSource } from "./github/github.source";
import { GitLabSource } from "./gitlab/gitlab.source";

export const createSource = (config: SourceConfig): BaseSource => {
	const name = config.name;

	if (name === "github") {
		return new GitHubSource(config);
	}

	if (name === "bitbucket") {
		return new BitbucketSource(config);
	}

	if (name === "gitlab") {
		return new GitLabSource(config);
	}

	const _exhaustive: never = name;

	throw new SourceError(
		`Unknown source adapter: ${(_exhaustive as { name: string }).name}\nPlease check configuration file.`,
	);
};
