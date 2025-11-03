import { Octokit } from "@octokit/rest";
import { OWNER, REPO } from "../../config";

const octokit = new Octokit({
	auth: process.env.GITHUB_TOKEN,
});

const upsertBranch = async (locale: string) => {
	const branch = `tr/${locale}`;

	try {
		await octokit.rest.repos.getBranch({
			branch,
			repo: REPO,
			owner: OWNER,
		});
	} catch {
		const res = await octokit.rest.repos.getBranch({
			branch: "main",
			repo: REPO,
			owner: OWNER,
		});

		await octokit.rest.git.createRef({
			sha: res.data.commit.sha,
			ref: `refs/heads/${branch}`,
			repo: REPO,
			owner: OWNER,
		});
	}

	return branch;
};

const readFile = async ({ path, ref }: { path: string; ref: string }) => {
	const { data } = await octokit.rest.repos.getContent({
		ref,
		path,
		repo: REPO,
		owner: OWNER,
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
		repo: REPO,
		owner: OWNER,
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
		repo: REPO,
		owner: OWNER,
		head: `${OWNER}:${branch}`,
		state: "open",
	});

	let prResponse: any;
	if (existingPRs.data.length > 0) {
		// PR already exists, use the existing one
		prResponse = existingPRs.data[0];
		console.log(`PR already exists for branch ${branch}`);
	} else {
		// Create a PR for the translation changes
		const prBody = `This PR was automatically created. Do not edit PR manually`;

		// Create the PR
		prResponse = await octokit.rest.pulls.create({
			owner: OWNER,
			repo: REPO,
			title,
			head: branch,
			base: "main",
			body: prBody,
		});

		console.log(
			`Created new PR for branch ${branch}: ${prResponse.data.html_url}`,
		);
	}
};

export default {
	upsertBranch,
	readFile,
	updateFile,
	updatePR,
};
