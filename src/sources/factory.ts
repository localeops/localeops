import type { Config } from "../config/config";
import type { BaseSource } from "./base.source";
import { GithubSource } from "./github.source";

export const createSource = async (
	sourceConfig: Config["source"],
): Promise<BaseSource> => {
	const adapter = sourceConfig.adapter;

	if (adapter.name === "github") {
		return new GithubSource(adapter);
	}

	throw new Error(`Unknown source adapter: ${adapter.name}`);
};
