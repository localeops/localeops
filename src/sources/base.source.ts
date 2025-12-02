import { execSync } from "node:child_process";
import type { Config } from "../config";

/**
 * Base class for source adapters that interact with version control systems
 */
export abstract class BaseSource {
	baseBranch: string;

	constructor(config: Config["source"]) {
		this.baseBranch = config.base;
	}

	checkout(branch: string): void {
		console.log(`[BaseSource] Attempting checkout for branch "${branch}"`);

		try {
			console.log(`[BaseSource] Verifying local branch "${branch}"`);

			execSync(`git rev-parse --verify ${branch}`, {
				stdio: "ignore",
			});

			console.log(
				`[BaseSource] Branch "${branch}" exists locally, checking out`,
			);

			execSync(`git checkout ${branch}`, { stdio: "inherit" });
		} catch {
			let remoteExists = false;

			try {
				console.log(
					`[BaseSource] Checking if remote branch "${branch}" exists on origin`,
				);

				execSync(`git ls-remote --exit-code --heads origin ${branch}`, {
					stdio: "ignore",
				});

				remoteExists = true;
			} catch {
				remoteExists = false;
			}

			if (remoteExists) {
				console.log(
					`[BaseSource] Remote branch "${branch}" detected; tracking origin`,
				);

				console.log(`[BaseSource] Fetching origin/${branch}`);

				execSync(`git fetch origin ${branch}`, {
					stdio: "inherit",
				});

				console.log(
					`[BaseSource] Checking out new local branch "${branch}" from FETCH_HEAD`,
				);

				execSync(`git checkout -b ${branch} FETCH_HEAD`, {
					stdio: "inherit",
				});
			} else {
				console.log(
					`[BaseSource] Creating new branch "${branch}" from base "${this.baseBranch}"`,
				);

				execSync(`git checkout ${this.baseBranch}`, { stdio: "inherit" });

				console.log(`[BaseSource] Creating branch "${branch}" locally`);

				execSync(`git checkout -b ${branch}`, { stdio: "inherit" });
			}
		}
	}

	/**
	 * Commits a file to the repository
	 * Creates or updates the file and creates a commit with the new content
	 */
	commitFile({ path, message }: { path: string; message: string }): void {
		console.log(
			`[BaseSource] Committing changes in "${path}" with message "${message}"`,
		);

		console.log(`[BaseSource] Staging path "${path}"`);

		// Stage the file (escape path for shell safety)
		execSync(`git add "${path}"`, { stdio: "inherit" });

		console.log(`[BaseSource] Executing commit`);

		// Commit the changes (escape commit message for shell safety)
		execSync(`git commit -m ${JSON.stringify(message)}`, {
			stdio: "inherit",
		});

		console.log(`[BaseSource] Commit complete`);
	}

	push(branch: string): void {
		console.log(`[BaseSource] Pushing branch "${branch}" to origin`);

		execSync(`git push -u origin ${branch}`, {
			stdio: "inherit",
		});

		console.log(`[BaseSource] Push complete for "${branch}"`);
	}

	/**
	 * Ensures a pull request exists
	 * Creates the pull request if it doesn't exist, does nothing if it already exists
	 */
	abstract ensurePullRequest({
		branch,
		title,
		description,
	}: {
		branch: string;
		title: string;
		description: string;
	}): Promise<void>;
}
