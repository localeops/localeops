import type { Octokit as OctokitInstance } from "@octokit/rest";
import { Octokit } from "@octokit/rest";
import type { Config } from "../config";
import { BaseSource, type SourceEntry } from "./base.source";

type GithubSourceConfig = Extract<
	Config["source"]["adapter"],
	{ name: "github" }
>;

export class GithubSource extends BaseSource {
	private repo: string;
	private owner: string;
	private octokit: OctokitInstance;

	constructor(config: GithubSourceConfig) {
		super();
		this.octokit = new Octokit({ auth: config.access_token });
		[this.owner, this.repo] = config.repository_name.split("/") as [
			string,
			string,
		];
	}

	async ensureBranch({ name, base }: { name: string; base: string }) {
		try {
			await this.octokit.rest.repos.getBranch({
				branch: name,
				repo: this.repo,
				owner: this.owner,
			});
		} catch {
			const res = await this.octokit.rest.repos.getBranch({
				branch: base,
				repo: this.repo,
				owner: this.owner,
			});

			await this.octokit.rest.git.createRef({
				repo: this.repo,
				owner: this.owner,
				sha: res.data.commit.sha,
				ref: `refs/heads/${name}`,
			});
		}
	}

	async getFile({ path, branch }: { path: string; branch: string }) {
		const { data } = await this.octokit.rest.repos.getContent({
			path,
			ref: branch,
			repo: this.repo,
			owner: this.owner,
		});

		if (Array.isArray(data) || data.type !== "file" || !data.content) {
			throw new Error(`Path is not a file: ${path}@${branch}`);
		}

		const sha = data.sha;
		const raw = Buffer.from(data.content, "base64").toString();
		const content = JSON.parse(raw);

		return { sha, content, raw };
	}

	async getDirectory({ path, branch }: { path: string; branch: string }) {
		const { data } = await this.octokit.rest.repos.getContent({
			path,
			ref: branch,
			repo: this.repo,
			owner: this.owner,
		});

		if (!Array.isArray(data)) {
			throw new Error(`Path is not a directory: ${path}@${branch}`);
		}

		const entries: SourceEntry[] = [];

		for (const entry of data) {
			if (entry.type === "dir" || entry.type === "file") {
				entries.push({
					type: entry.type,
					name: entry.name,
					path: entry.path,
				});
			}
		}

		return entries;
	}

	async commitFile({
		path,
		branch,
		content,
		sha,
		message,
	}: {
		path: string;
		branch: string;
		content: string;
		sha: string;
		message: string;
	}) {
		await this.octokit.rest.repos.createOrUpdateFileContents({
			path,
			branch,
			sha,
			repo: this.repo,
			owner: this.owner,
			message,
			content: Buffer.from(content).toString("base64"),
		});
	}

	async ensurePullRequest({
		body,
		base,
		title,
		branch,
	}: {
		body: string;
		base: string;
		title: string;
		branch: string;
	}) {
		const existingPullRequests = await this.octokit.rest.pulls.list({
			state: "open",
			repo: this.repo,
			owner: this.owner,
			head: `${this.owner}:${branch}`,
		});

		if (existingPullRequests.data.length === 0) {
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
