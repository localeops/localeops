import { Value } from "@sinclair/typebox/value";
import type { Config } from "../../config";
import { BaseSource } from "../base.source";
import { GitHubPullRequestListSchema } from "./github.schema";
import type { GitHubPullRequest } from "./github.types";

type GitHubSourceConfig = Extract<Config["source"], { name: "github" }>;

export class GitHubSource extends BaseSource {
	repo: string;
	token: string;
	apiUrl: string;

	constructor(config: GitHubSourceConfig) {
		super(config);
		this.repo = config.repo;
		this.token = config.token;
		this.apiUrl = config.apiUrl;
	}

	private get authHeaders() {
		return {
			"Content-Type": "application/json",
			Authorization: `token ${this.token}`,
			Accept: "application/vnd.github.v3+json",
		};
	}

	private async findPullRequest(
		branch: string,
	): Promise<GitHubPullRequest | null> {
		console.log(`[GitHub] Finding existing PR for branch "${branch}"...`);

		const [owner, repo] = this.repo.split("/");

		try {
			const response = await fetch(
				`${this.apiUrl}/repos/${owner}/${repo}/pulls?head=${owner}:${branch}&state=open`,
				{ headers: this.authHeaders },
			);

			if (response.ok) {
				const data = Value.Parse(
					GitHubPullRequestListSchema,
					await response.json(),
				);

				const pr = data[0];

				return pr ?? null;
			} else if (response.status !== 404) {
				const errorText = await response.text();

				throw new Error(
					`[GitHub] Failed to get open PRs: ${response.status} ${errorText}`,
				);
			}

			return null;
		} catch (error) {
			throw new Error(`[GitHub] Error finding pull request: ${error}`);
		}
	}

	private async updatePullRequest({
		prNumber,
		title,
		body,
	}: {
		prNumber: number;
		title: string;
		body: string;
	}) {
		console.log(`[GitHub] Updating pull request #${prNumber}...`);

		const [owner, repo] = this.repo.split("/");

		const response = await fetch(
			`${this.apiUrl}/repos/${owner}/${repo}/pulls/${prNumber}`,
			{
				method: "PATCH",
				headers: this.authHeaders,
				body: JSON.stringify({ title, body }),
			},
		);

		if (!response.ok) {
			const errorText = await response.text();

			throw new Error(
				`[GitHub] Failed to update PR #${prNumber}: ${response.status} ${errorText}`,
			);
		}
	}

	private async createPullRequest({
		branch,
		title,
		body,
	}: {
		branch: string;
		title: string;
		body: string;
	}) {
		console.log(`[GitHub] Creating new pull request for "${branch}"...`);

		const [owner, repo] = this.repo.split("/");

		const response = await fetch(
			`${this.apiUrl}/repos/${owner}/${repo}/pulls`,
			{
				method: "POST",
				headers: this.authHeaders,
				body: JSON.stringify({
					title,
					body,
					head: branch,
					base: this.baseBranch,
				}),
			},
		);

		if (!response.ok) {
			const errorText = await response.text();

			throw new Error(
				`[GitHub] Failed to create PR: ${response.status} ${errorText}`,
			);
		}
	}

	async ensurePullRequest({
		branch,
		title,
		description,
	}: {
		branch: string;
		title: string;
		description: string;
	}) {
		console.log(`[GitHub] Ensuring pull request for branch "${branch}"...`);

		try {
			const pullRequest = await this.findPullRequest(branch);

			if (pullRequest) {
				await this.updatePullRequest({
					title,
					body: description,
					prNumber: pullRequest.number,
				});
			} else {
				await this.createPullRequest({
					branch,
					title,
					body: description,
				});
			}
		} catch (error) {
			console.error(
				`[GitHub] Error ensuring pull request for ${branch}:`,
				error,
			);

			throw error;
		}
	}
}
