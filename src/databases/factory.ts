import type { Config } from "../config/config";
import { resolveConfigPath } from "../shared";
import type { BaseDatabase } from "./base.database";
import { FileDatabase } from "./file.database";
import { SqliteDatabase } from "./sqlite.database";

export const createDatabase = async (
	databaseConfig: Config["database"],
): Promise<BaseDatabase> => {
	const adapter = databaseConfig.adapter;

	if (adapter.name === "file") {
		return new FileDatabase({
			path: resolveConfigPath(adapter.path),
		});
	}

	if (adapter.name === "sqlite") {
		return new SqliteDatabase({
			path: resolveConfigPath(adapter.path),
		});
	}

	if (adapter.name === "custom") {
		const module = await import(adapter.path);
		const CustomDatabaseClass = module.default || module;
		return new CustomDatabaseClass();
	}

	const _exhaustive: never = adapter;
	throw new Error(
		`Unknown database adapter: ${(_exhaustive as { name: string }).name}`,
	);
};
