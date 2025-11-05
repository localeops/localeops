import { Octokit } from "@octokit/rest";
import { config } from "../../config";

const octokit = new Octokit({
	auth: config.source.adapter.access_token,
});

const upsertBranch = async (locale: string) => {
	const branch = `tr/${locale}`;

	const [owner, repo] = config.source.adapter.repository_name.split("/") as [
		string,
		string,
	];

	try {
		await octokit.rest.repos.getBranch({ branch, owner, repo });
	} catch {
		const res = await octokit.rest.repos.getBranch({
			branch: config.source.branch,
			owner,
			repo,
		});

		await octokit.rest.git.createRef({
			sha: res.data.commit.sha,
			ref: `refs/heads/${branch}`,
			owner,
			repo,
		});
	}

	return branch;
};

const readFile = async ({ path, ref }: { path: string; ref: string }) => {
	const [owner, repo] = config.source.adapter.repository_name.split("/") as [
		string,
		string,
	];

	const { data } = await octokit.rest.repos.getContent({
		ref,
		path,
		owner,
		repo,
	});

	if (Array.isArray(data) || data.type !== "file" || !data.content) {
		throw new Error(`Path is not a file: ${path}@${ref}`);
	}

	const sha = data.sha;
	const raw = Buffer.from(data.content, "base64").toString();
	const content = JSON.parse(raw);

	return { sha, content, raw };
};

const readDir = async ({ path, ref }: { path: string; ref: string }) => {
	const [owner, repo] = config.source.adapter.repository_name.split("/") as [
		string,
		string,
	];

	const { data } = await octokit.rest.repos.getContent({
		ref,
		path,
		owner,
		repo,
	});

	if (!Array.isArray(data)) {
		throw new Error(`Path is not a directory: ${path}@${ref}`);
	}

	return data;
};

const updateFile = async ({
	path,
	content,
	branch,
	sha,
}: {
	path: string;
	content: string;
	branch: string;
	sha?: string;
}) => {
	const [owner, repo] = config.source.adapter.repository_name.split("/") as [
		string,
		string,
	];

	const message = `update for ${path}/${"update id"}`;
	await octokit.rest.repos.createOrUpdateFileContents({
		path,
		message,
		content: Buffer.from(content).toString("base64"),
		branch,
		owner,
		repo,
		sha, // Include SHA if updating existing file
	});
};

const updatePR = async ({
	branch,
	locale,
}: {
	branch: string;
	locale: string;
}) => {
	const title = `TR/${locale}`;

	const [owner, repo] = config.source.adapter.repository_name.split("/") as [
		string,
		string,
	];

	const existingPRs = await octokit.rest.pulls.list({
		owner,
		repo,
		head: `${owner}:${branch}`,
		state: "open",
	});

	if (existingPRs.data.length === 0) {
		// Create a PR for the translation changes
		const prBody = `
This PR was automatically created. 
Do not edit PR manually
		`;

		// Create the PR
		await octokit.rest.pulls.create({
			owner,
			repo,
			title,
			head: branch,
			base: config.source.branch,
			body: prBody,
		});
	}
};

export default {
	upsertBranch,
	readFile,
	updateFile,
	updatePR,
	readDir,
};
