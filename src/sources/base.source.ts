import type { Config } from "../config";
import { logger } from "../shared/logger";
import { runCommand } from "../shared/utils";

export abstract class BaseSource {
	baseBranch: string;

	constructor(config: Config["source"]) {
		this.baseBranch = config.base;
	}

	checkout(branch: string): void {
		logger.debug(`[BaseSource] Checking out branch "${branch}"`);

		try {
			runCommand(["git", "rev-parse", "--verify", branch]);
			runCommand(["git", "checkout", branch]);
		} catch {
			try {
				runCommand([
					"git",
					"ls-remote",
					"--exit-code",
					"--heads",
					"origin",
					branch,
				]);

				logger.debug(`[BaseSource] Fetching remote branch "${branch}"`);
				runCommand(["git", "fetch", "origin", branch]);
				runCommand(["git", "checkout", "-b", branch, "FETCH_HEAD"]);
			} catch {
				logger.debug(`[BaseSource] Creating new branch "${branch}"`);
				runCommand(["git", "checkout", this.baseBranch]);
				runCommand(["git", "checkout", "-b", branch]);
			}
		}
	}

	commitFile({ path, message }: { path: string; message: string }): void {
		logger.debug(`[BaseSource] Committing "${path}"`);
		runCommand(["git", "add", path]);
		runCommand(["git", "commit", "-m", message]);
	}

	push(branch: string): void {
		logger.debug(`[BaseSource] Pushing branch "${branch}"`);
		runCommand(["git", "push", "-u", "origin", branch]);
	}

	/**
	 * Ensures a pull request exists
	 * Creates the pull request if it doesn't exist or updates it if it does
	 */
	abstract ensurePullRequest({
		title,
		branch,
		description,
	}: {
		title: string;
		branch: string;
		description: string;
	}): Promise<void>;
}
