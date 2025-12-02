import type { Static } from "@sinclair/typebox";
import type { GitHubPullRequestSchema } from "./github.schema";

export type GitHubPullRequest = Static<typeof GitHubPullRequestSchema>;
