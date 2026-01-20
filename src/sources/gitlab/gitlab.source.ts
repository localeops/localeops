import type { SourceConfig } from "../../config/config";
import { SourceError } from "../../core/errors";
import { logger } from "../../shared/logger";
import { BaseSource } from "../base.source";

type GitLabSourceConfig = Extract<SourceConfig, { name: "gitlab" }>;

export class GitLabSource extends BaseSource {
	repo: string;
	token: string;
	apiUrl: string;

	constructor(config: GitLabSourceConfig) {
		super(config);
		this.repo = config.repo;
		this.token = config.token;
		this.apiUrl = "https://gitlab.com/api/v4";
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
		logger.debug(`[GitLab] Ensuring merge request for branch "${branch}"...`);

		const projectId = encodeURIComponent(this.repo);

		const url = `${this.apiUrl}/projects/${projectId}/merge_requests`;

		const response = await fetch(url, {
			method: "POST",
			headers: this.authHeaders,
			body: JSON.stringify({
				source_branch: branch,
				target_branch: this.baseBranch,
				title,
				description,
				remove_source_branch: false,
			}),
		});

		if (!response.ok) {
			if (response.status === 409) {
				logger.debug(
					`[GitLab] Merge request for branch "${branch}" already exists.`,
				);

				return;
			}

			const errorText = await response.text();
			throw new SourceError(
				`[GitLab] Failed to create merge request: ${response.status} ${errorText}`,
			);
		}
	}
}
