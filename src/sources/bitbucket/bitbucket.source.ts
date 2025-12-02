import { Value } from "@sinclair/typebox/value";
import type { Config } from "../../config";
import { BaseSource } from "../base.source";
import { BitbucketPullRequestListSchema } from "./bitbucket.schema";
import type { BitbucketPullRequest } from "./bitbucket.types";

type BitbucketSourceConfig = Extract<Config["source"], { name: "bitbucket" }>;

export class BitbucketSource extends BaseSource {
	token: string;
	repo: string;
	apiUrl: string;

	constructor(config: BitbucketSourceConfig) {
		super(config);
		this.token = config.token;
		this.repo = config.repo;
		this.apiUrl = config.apiUrl;
	}

	private get authHeaders() {
		return {
			Authorization: `Bearer ${this.token}`,
			Accept: "application/json",
			"Content-Type": "application/json",
		};
	}

	private async findPullRequest(
		branch: string,
	): Promise<BitbucketPullRequest | null> {
		console.log(`[Bitbucket] Finding existing PR for branch "${branch}"...`);

		try {
			const response = await fetch(
				`${this.apiUrl}/repositories/${this.repo}/pullrequests?state=OPEN`,
				{ headers: this.authHeaders },
			);

			if (response.ok) {
				const data = Value.Parse(
					BitbucketPullRequestListSchema,
					await response.json(),
				);

				const pr = data.values.find((pr) => {
					return pr.source.branch.name === branch;
				});

				return pr ?? null;
			} else if (response.status !== 404) {
				const errorText = await response.text();

				throw new Error(
					`[Bitbucket] Failed to get open PRs: ${response.status} ${errorText}`,
				);
			}

			return null;
		} catch (error) {
			throw new Error(`[Bitbucket] Error finding pull request: ${error}`);
		}
	}

	private async updatePullRequest({
		prId,
		title,
		description,
	}: {
		prId: number;
		title: string;
		description: string;
	}) {
		console.log(`[Bitbucket] Updating pull request #${prId}...`);

		const response = await fetch(
			`${this.apiUrl}/repositories/${this.repo}/pullrequests/${prId}`,
			{
				method: "PUT",
				headers: this.authHeaders,
				body: JSON.stringify({ title, description }),
			},
		);

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(
				`[Bitbucket] Failed to update PR #${prId}: ${response.status} ${errorText}`,
			);
		}
	}

	private async createPullRequest({
		branch,
		title,
		description,
	}: {
		branch: string;
		title: string;
		description: string;
	}) {
		console.log(`[Bitbucket] Creating new pull request for "${branch}"...`);

		const response = await fetch(
			`${this.apiUrl}/repositories/${this.repo}/pullrequests`,
			{
				method: "POST",
				headers: this.authHeaders,
				body: JSON.stringify({
					title,
					description,
					source: {
						branch: {
							name: branch,
						},
					},
					destination: {
						branch: {
							name: this.baseBranch,
						},
					},
					close_source_branch: false,
				}),
			},
		);

		if (!response.ok) {
			const errorText = await response.text();

			throw new Error(
				`[Bitbucket] Failed to create PR: ${response.status} ${errorText}`,
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
		console.log(`[Bitbucket] Ensuring pull request for branch "${branch}"...`);

		try {
			const pullRequest = await this.findPullRequest(branch);

			if (pullRequest) {
				await this.updatePullRequest({
					prId: pullRequest.id,
					title,
					description,
				});
			} else {
				await this.createPullRequest({
					branch,
					description,
					title,
				});
			}
		} catch (error) {
			console.error(
				`[Bitbucket] Error ensuring pull request for ${branch}:`,
				error,
			);

			throw error;
		}
	}
}
