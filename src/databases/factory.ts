import type { Config } from "../config";
import type { BaseDatabase } from "./base.database";
import { FileDatabase } from "./file.database";

export const createDatabase = async (
	databaseConfig: Config["database"],
): Promise<BaseDatabase> => {
	const adapter = databaseConfig.adapter;

	if (adapter.name === "file") {
		return new FileDatabase();
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
