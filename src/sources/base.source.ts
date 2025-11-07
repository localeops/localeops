import type { I18nResource } from "../core/state";

type File = {
	identifier: string;
	content: I18nResource;
	raw: string;
};

export type DirEntry = {
	type: "dir" | "file";
	name: string;
	path: string;
};

export abstract class BaseSource {
	/**
	 * Create a new branch from base branch with given name if it doesn't exist
	 */
	abstract upsertBranchFromBase(params: {
		branchName: string;
		baseBranch: string;
	}): Promise<void>;

	/**
	 * Reads file content
	 * Returns file content, raw value and indentifier (e.g. sha)
	 */
	abstract readFile(params: { path: string; ref: string }): Promise<File>;

	/**
	 * Reads directory contents
	 * Returns directory entries
	 */
	abstract readDir(param: {
		path: string;
		ref: string;
	}): Promise<Array<DirEntry>>;

	/**
	 * Updates remote file
	 */
	abstract updateFile(params: {
		path: string;
		branch: string;
		content: string;
		identifier: string;
		commitMessage: string;
	}): Promise<void>;

	/**
	 */
	abstract updatePR(params: {
		branch: string;
		title: string;
		body: string;
		base: string;
	}): Promise<void>;
}
