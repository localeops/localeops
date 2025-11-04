import { Octokit } from "@octokit/rest";
import config from "../../config";

const octokit = new Octokit({
	auth: config.GITHUB_TOKEN,
});

const upsertBranch = async (locale: string) => {
	const branch = `tr/${locale}`;

	try {
		await octokit.rest.repos.getBranch({
			branch,
			owner: config.GITHUB_OWNER,
			repo: config.GITHUB_REPO,
		});
	} catch {
		const res = await octokit.rest.repos.getBranch({
			branch: "main",
			owner: config.GITHUB_OWNER,
			repo: config.GITHUB_REPO,
		});

		await octokit.rest.git.createRef({
			sha: res.data.commit.sha,
			ref: `refs/heads/${branch}`,
			owner: config.GITHUB_OWNER,
			repo: config.GITHUB_REPO,
		});
	}

	return branch;
};

const readFile = async ({ path, ref }: { path: string; ref: string }) => {
	const { data } = await octokit.rest.repos.getContent({
		ref,
		path,
		owner: config.GITHUB_OWNER,
		repo: config.GITHUB_REPO,
	});

	if (Array.isArray(data) || data.type !== "file" || !data.content) {
		throw new Error(`Path is not a file: ${path}@${ref}`);
	}

	const sha = data.sha;
	const raw = Buffer.from(data.content, "base64").toString();
	const content = JSON.parse(raw);

	return { sha, content, raw };
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
	const message = `update for ${path}/${"update id"}`;
	await octokit.rest.repos.createOrUpdateFileContents({
		path,
		message,
		content: Buffer.from(content).toString("base64"),
		branch,
		owner: config.GITHUB_OWNER,
		repo: config.GITHUB_REPO,
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

	const existingPRs = await octokit.rest.pulls.list({
		owner: config.GITHUB_OWNER,
		repo: config.GITHUB_REPO,
		head: `${config.GITHUB_OWNER}:${branch}`,
		state: "open",
	});

	let prResponse: any;
	if (existingPRs.data.length > 0) {
		// PR already exists, use the existing one
		prResponse = existingPRs.data[0];
	} else {
		// Create a PR for the translation changes
		const prBody = `This PR was automatically created. Do not edit PR manually`;

		// Create the PR
		prResponse = await octokit.rest.pulls.create({
			owner: config.GITHUB_OWNER,
			repo: config.GITHUB_REPO,
			title,
			head: branch,
			base: "main",
			body: prBody,
		});
	}
};

export default {
	upsertBranch,
	readFile,
	updateFile,
	updatePR,
};
