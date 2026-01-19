import type { SourceConfig } from "../../config/config";
import { SourceError } from "../../core/errors";
import { logger } from "../../shared/logger";
import { BaseSource } from "../base.source";

type BitbucketSourceConfig = Extract<SourceConfig, { name: "bitbucket" }>;

export class BitbucketSource extends BaseSource {
	repo: string;
	token: string;
	apiUrl: string;

	constructor(config: BitbucketSourceConfig) {
		super(config);
		this.repo = config.repo;
		this.token = config.token;
		this.apiUrl = "https://api.bitbucket.org/2.0";
	}

	private get authHeaders() {
		return {
			"Content-Type": "application/json",
			Authorization: `Bearer ${this.token}`,
			Accept: "application/json",
		};
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
		logger.debug(`[Bitbucket] Ensuring pull request for branch "${branch}"...`);

		const [workspace, repoSlug] = this.repo.split("/");

		const url = `${this.apiUrl}/repositories/${workspace}/${repoSlug}/pullrequests`;

		const response = await fetch(url, {
			method: "POST",
			headers: this.authHeaders,
			body: JSON.stringify({
				title,
				description,
				source: { branch: { name: branch } },
				destination: { branch: { name: this.baseBranch } },
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new SourceError(
				`[Bitbucket] Failed to create PR: ${response.status} ${errorText}`,
			);
		}
	}
}
