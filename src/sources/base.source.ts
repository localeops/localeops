/**
 * Represents a file fetched from the source repository
 */
export type SourceFile = {
	sha: string;
	raw: string;
	content: unknown;
};

/**
 * Represents a directory entry (file or subdirectory)
 */
export type SourceEntry = {
	type: "dir" | "file";
	name: string;
	path: string;
};

/**
 * Base class for source adapters that interact with version control systems
 */
export abstract class BaseSource {
	/**
	 * Gets file content from the repository
	 * Returns decoded content, raw string, and sha identifier
	 */
	abstract getFile(params: {
		path: string;
		branch: string;
	}): Promise<SourceFile>;

	/**
	 * Gets directory contents from the repository
	 * Returns list of files and subdirectories
	 */
	abstract getDirectory(params: {
		path: string;
		branch: string;
	}): Promise<Array<SourceEntry>>;

	/**
	 * Ensures a branch exists
	 * Creates the branch from base if it doesn't exist, does nothing if it already exists
	 */
	abstract ensureBranch(params: { name: string; base: string }): Promise<void>;

	/**
	 * Ensures a pull request exists
	 * Creates the pull request if it doesn't exist, does nothing if it already exists
	 */
	abstract ensurePullRequest(params: {
		branch: string;
		title: string;
		body: string;
		base: string;
	}): Promise<void>;

	/**
	 * Commits a file to the repository
	 * Creates or updates the file and creates a commit with the new content
	 */
	abstract commitFile(params: {
		sha: string;
		path: string;
		branch: string;
		content: string;
		message: string;
	}): Promise<void>;
}
