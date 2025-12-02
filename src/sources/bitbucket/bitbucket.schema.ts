import { Type } from "@sinclair/typebox";

export const BitbucketPullRequestSchema = Type.Object({
	id: Type.Number(),
	source: Type.Object({
		branch: Type.Object({
			name: Type.String(),
		}),
	}),
});

export const BitbucketPullRequestListSchema = Type.Object({
	values: Type.Array(BitbucketPullRequestSchema),
});
