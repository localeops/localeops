import { beforeEach, describe, expect, it } from "bun:test";
import path from "node:path";
import type { Translation } from "../../apply";
import type { BaseFramework } from "../base/base.framework";
import type { Snapshot } from "../base/base.types";
import { createFramework } from "../factory";

const fixturesDir = path.join(import.meta.dir, "fixtures");

const frameworks = [
	{
		name: "formatjs" as const,
		locale: "en",
		directory: path.join(fixturesDir, "formatjs"),
		expectedFiles: [
			"common.json",
			"errors.json",
			path.join("nested", "messages.json"),
		],
	},
	{
		name: "i18next" as const,
		locale: "en",
		directory: path.join(fixturesDir, "i18next"),
		expectedFiles: [
			"common.json",
			"errors.json",
			path.join("nested", "messages.json"),
		],
	},
];

describe.each(frameworks)(
	"$name Framework",
	({ name, directory, locale, expectedFiles }) => {
		let framework: BaseFramework<unknown>;

		beforeEach(() => {
			framework = createFramework({
				name,
				locale,
				directory,
			});
		});

		describe("snapshot", () => {
			it("should read all localization files from the source locale directory", () => {
				const snapshot = framework.snapshot();

				const snapshotKeys = Object.keys(snapshot);

				expect(snapshotKeys).toHaveLength(expectedFiles.length);

				for (const file of expectedFiles) {
					expect(snapshotKeys).toContain(file);
				}
			});
		});

		describe("deserialize & serialize", () => {
			it("should roundtrip serialize and deserialize", () => {
				const snapshot = framework.snapshot();
				const firstFile = Object.keys(snapshot)[0];

				if (!firstFile) {
					throw new Error("No files in snapshot");
				}

				const resource = snapshot[firstFile];

				const serialized = framework.serialize(resource);

				const deserialized = framework.deserialize(serialized);

				expect(deserialized).toEqual(resource);
			});
		});

		it("full workflow imitation", () => {
			const oldSnapshot: Snapshot<unknown> = {};

			const newSnapshot = framework.snapshot();

			const deltas = framework.diffSnapshots({
				newSnapshot,
				oldSnapshot,
			});

			expect(deltas.length).not.toEqual(0);

			const translations = deltas.reduce((acc, d) => {
				if (d.type === "added") {
					acc.push({
						from: d.value,
						value: `[fr]${d.value}`,
						filePath: d.filePath,
						resourcePath: d.resourcePath,
					});
				} else if (d.type === "changed") {
					acc.push({
						from: d.newValue,
						value: `[fr]${d.newValue}`,
						filePath: d.filePath,
						resourcePath: d.resourcePath,
					});
				}
				return acc;
			}, [] as Translation[]);

			// Staleness check
			for (const tr of translations) {
				const resource = newSnapshot[tr.filePath];

				const value = framework.resolve({
					resource,
					resourcePath: tr.resourcePath,
				});

				expect(value).toEqual(tr.from);
			}

			// Update old snapshot according to translations
			const updates = translations.map((tr) => ({
				value: tr.from,
				filePath: tr.filePath,
				resourcePath: tr.resourcePath,
			}));

			for (const update of updates) {
				const resource = oldSnapshot[update.filePath];

				const updatedResource = framework.patch({
					resource,
					updates: [
						{
							value: update.value,
							resourcePath: update.resourcePath,
						},
					],
				});

				oldSnapshot[update.filePath] = updatedResource;
			}

			const finalDeltas = framework.diffSnapshots({
				newSnapshot,
				oldSnapshot,
			});

			expect(finalDeltas).toHaveLength(0);
		});
	},
);
