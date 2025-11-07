import type { Octokit as OctokitInstance } from "@octokit/rest";
import { Octokit } from "@octokit/rest";
import { Value } from "@sinclair/typebox/value";
import type { Config } from "../config";
import type { I18nResource } from "../core/state";
import { i18nResource } from "../core/state/state.schema";
import { BaseSource, type DirEntry } from "./base.source";

type GithubSourceConfig = Config["source"]["adapter"];

export class GithubSource extends BaseSource {
	private repo: string;
	private owner: string;
	private octokit: OctokitInstance;

	constructor(config: GithubSourceConfig) {
		const [owner, repo] = config.repository_name.split("/") as [string, string];

		super();

		this.repo = repo;

		this.owner = owner;

		this.octokit = new Octokit({ auth: config.access_token });
	}

	async upsertBranchFromBase({
		branchName,
		baseBranch,
	}: {
		branchName: string;
		baseBranch: string;
	}) {
		try {
			await this.octokit.rest.repos.getBranch({
				branch: branchName,
				owner: this.owner,
				repo: this.repo,
			});
		} catch {
			const res = await this.octokit.rest.repos.getBranch({
				repo: this.repo,
				owner: this.owner,
				branch: baseBranch,
			});

			await this.octokit.rest.git.createRef({
				repo: this.repo,
				owner: this.owner,
				sha: res.data.commit.sha,
				ref: `refs/heads/${branchName}`,
			});
		}
	}

	async readFile({ path, ref }: { path: string; ref: string }) {
		const { data } = await this.octokit.rest.repos.getContent({
			ref,
			path,
			repo: this.repo,
			owner: this.owner,
		});

		if (Array.isArray(data) || data.type !== "file" || !data.content) {
			throw new Error(`Path is not a file: ${path}@${ref}`);
		}

		const identifier = data.sha;

		const raw = Buffer.from(data.content, "base64").toString();

		const content: I18nResource = Value.Parse(i18nResource, JSON.parse(raw));

		return { identifier, content, raw };
	}

	async readDir({ path, ref }: { path: string; ref: string }) {
		const { data } = await this.octokit.rest.repos.getContent({
			ref,
			path,
			repo: this.repo,
			owner: this.owner,
		});

		if (!Array.isArray(data)) {
			throw new Error(`Path is not a directory: ${path}@${ref}`);
		}

		const entries: DirEntry[] = [];

		for (const entry of data) {
			if (entry.type === "dir") {
				entries.push({
					type: entry.type,
					name: entry.name,
					path: entry.path,
				});
			}

			if (entry.type === "file") {
				entries.push({
					type: entry.type,
					name: entry.name,
					path: entry.path,
				});
			}
		}

		return entries;
	}

	async updateFile({
		path,
		branch,
		content,
		identifier,
		commitMessage,
	}: {
		path: string;
		branch: string;
		content: string;
		identifier: string;
		commitMessage: string;
	}) {
		await this.octokit.rest.repos.createOrUpdateFileContents({
			path,
			branch,
			sha: identifier,
			repo: this.repo,
			owner: this.owner,
			message: commitMessage,
			content: Buffer.from(content).toString("base64"),
		});
	}

	async updatePR({
		branch,
		title,
		body,
		base,
	}: {
		branch: string;
		title: string;
		body: string;
		base: string;
	}) {
		const existingPRs = await this.octokit.rest.pulls.list({
			state: "open",
			repo: this.repo,
			owner: this.owner,
			head: `${this.owner}:${branch}`,
		});

		if (existingPRs.data.length === 0) {
			await this.octokit.rest.pulls.create({
				base,
				body,
				title,
				head: branch,
				repo: this.repo,
				owner: this.owner,
			});
		}
	}
}
