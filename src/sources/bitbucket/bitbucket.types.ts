import type { Static } from "@sinclair/typebox";
import type { BitbucketPullRequestSchema } from "./bitbucket.schema";

export type BitbucketPullRequest = Static<typeof BitbucketPullRequestSchema>;
