import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

import { config } from "./config";
import { createDatabase } from "./databases/factory";
import { SnapshotSchema } from "./framework/base/base.schema";
import { createFramework } from "./framework/factory";
import { getTranslationBranchName } from "./shared/utils";
import { createSource } from "./sources/factory";

const source = createSource(config.source);

const framework = createFramework(config.framework);

const database = await createDatabase(config.database);

await database.initialize();

export const GetUntranslatedPayloadSchema = Type.Object({
	locale: Type.String(),
	callback_url: Type.String(),
});

const getUntranslated = async () => {
	try {
		const payload = process.env.DISPATCH_PAYLOAD;

		if (!payload) {
			throw new Error("No dispatch payload");
		}

		const parsedPayload = Value.Parse(
			GetUntranslatedPayloadSchema,
			JSON.parse(payload),
		);

		const { locale, callback_url } = parsedPayload;

		const localeBranchName = getTranslationBranchName(locale);

		source.checkout(localeBranchName);

		let oldSnapshot = await database.get(locale);

		if (oldSnapshot === null) {
			oldSnapshot = JSON.stringify({});
		}

		const oldSnapshotParsed = Value.Parse(
			SnapshotSchema,
			JSON.parse(oldSnapshot),
		);

		console.log("Old snapshot: ", oldSnapshotParsed);

		source.checkout(config.source.base);

		const newSnapshot = framework.snapshotSourceLocaleDir();

		console.log("New snapshot: ", newSnapshot);

		const diff = framework.diffSnapshots({
			newSnapshot,
			oldSnapshot: oldSnapshotParsed,
		});

		const diffJson = JSON.stringify(diff);

		console.log("Snapshot diff: ", diffJson);

		try {
			const response = await fetch(callback_url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: diffJson,
			});

			if (!response.ok) {
				console.error(
					`Callback failed: ${response.status} ${response.statusText}`,
				);

				throw new Error(`Failed to call callback URL: ${response.statusText}`);
			}
		} catch (error) {
			throw new Error(`Error sending callback: ${error}`);
		}

		return diff;
	} catch (error) {
		throw new Error(`Error getting untranslated: ${error}`);
	}
};

export default getUntranslated;
