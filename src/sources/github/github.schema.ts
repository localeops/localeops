import { Type } from "@sinclair/typebox";

export const GitHubPullRequestSchema = Type.Object({
	id: Type.Number(),
	number: Type.Number(),
});

export const GitHubPullRequestListSchema = Type.Array(GitHubPullRequestSchema);
