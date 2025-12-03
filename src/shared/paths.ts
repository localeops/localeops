import path from "node:path";

const baseDir = process.cwd();

/**
 * Resolves a file path relative to the application base directory.
 *
 * In production, paths are resolved relative to the binary location.
 * In development, paths are resolved relative to the project root.
 *
 * @param filePath - The file path to resolve (relative or absolute)
 * @returns The resolved absolute path
 *
 * @example
 * // Development: resolves to project root
 * resolveConfigPath("./data.json") // => "/project/root/data.json"
 *
 * // Production: resolves to binary directory
 * resolveConfigPath("./data.json") // => "/usr/local/bin/data.json"
 *
 * // Absolute paths are returned as-is
 * resolveConfigPath("/var/lib/data.json") // => "/var/lib/data.json"
 *
 * // Special values are preserved
 * resolveConfigPath(":memory:") // => ":memory:"
 */
export const resolveConfigPath = (filePath: string): string => {
	// Preserve special values (e.g., SQLite :memory:)
	if (filePath.startsWith(":")) {
		return filePath;
	}

	// If already absolute, return as-is
	if (path.isAbsolute(filePath)) {
		return filePath;
	}

	// Resolve relative paths against baseDir
	return path.resolve(baseDir, filePath);
};
