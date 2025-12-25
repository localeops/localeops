import type { Config } from "../config";
import type { BaseDatabase } from "../databases/base.database";
import { createDatabase } from "../databases/factory";
import type { BaseFramework } from "../framework/base/base.framework";
import { createFramework } from "../framework/factory";
import type { BaseSource } from "../sources/base.source";
import { createSource } from "../sources/factory";

export class LocaleOpsContext {
	readonly config: Config;
	readonly source: BaseSource;
	readonly database: BaseDatabase;
	readonly framework: BaseFramework<unknown>;

	private constructor(params: {
		config: Config;
		source: BaseSource;
		database: BaseDatabase;
		framework: BaseFramework<unknown>;
	}) {
		this.config = params.config;
		this.source = params.source;
		this.database = params.database;
		this.framework = params.framework;
	}

	static async create(config: Config): Promise<LocaleOpsContext> {
		const source = createSource(config.source);
		const framework = createFramework(config.framework);
		const database = await createDatabase(config.database);

		await database.initialize();

		return new LocaleOpsContext({ config, framework, database, source });
	}
}
