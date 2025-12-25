import { beforeEach, describe, expect, it } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import type { Translation } from "../../core/types";
import type { BaseFramework } from "../base/base.framework";
import type { Snapshot } from "../base/base.types";
import { createFramework } from "../factory";

const fixturesDir = path.join(import.meta.dir, "fixtures");

const frameworks = [
	{
		name: "formatjs" as const,
		locale: "en",
		targets: ["fr"],
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
		targets: ["fr"],
		directory: path.join(fixturesDir, "i18next"),
		expectedFiles: [
			"common.json",
			"errors.json",
			path.join("nested", "messages.json"),
		],
	},
];

describe.each(frameworks)("$name Framework", ({
	name,
	targets,
	directory,
	locale,
	expectedFiles,
}) => {
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

		it("should return empty diff when two snapshots are empty", () => {
			const deltas = framework.diffSnapshots({
				newSnapshot: {},
				oldSnapshot: {},
			});

			expect(deltas).toHaveLength(0);
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

	describe("resource", () => {
		it("should throw on non-existent resource path resolution", () => {
			const snapshot = framework.snapshot();

			const firstFile = Object.keys(snapshot)[0];

			if (!firstFile) {
				throw new Error("No files in snapshot");
			}

			const resource = snapshot[firstFile];

			expect(() =>
				framework.resolve({
					resource,
					resourcePath: ["this", "path", "does", "not", "exist"],
				}),
			).toThrow();
		});
	});

	it("full workflow imitation", () => {
		const translate = (value: string, locale: string) => {
			return `[${locale}]${value}`;
		};

		for (const locale of targets) {
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
						value: translate(d.value, locale),
						filePath: d.filePath,
						resourcePath: d.resourcePath,
					});
				} else if (d.type === "changed") {
					acc.push({
						from: d.newValue,
						value: translate(d.newValue, locale),
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

			// Update target localization files
			for (const translation of translations) {
				const fullFilePath = framework.resolveFilePath({
					filePath: translation.filePath,
					locale,
				});

				let content: string;

				if (fs.existsSync(fullFilePath)) {
					const raw = fs.readFileSync(fullFilePath, { encoding: "utf8" });

					const resource = framework.deserialize(raw);

					const updatedResource = framework.patch({
						resource,
						updates: [translation],
					});

					content = framework.serialize(updatedResource);
				} else {
					const updatedResource = framework.patch({
						updates: [translation],
					});

					content = framework.serialize(updatedResource);
				}

				fs.mkdirSync(path.dirname(fullFilePath), { recursive: true });

				fs.writeFileSync(fullFilePath, content, { encoding: "utf8" });

				const verifyRaw = fs.readFileSync(fullFilePath, { encoding: "utf8" });

				const verifyResource = framework.deserialize(verifyRaw);

				const verifyValue = framework.resolve({
					resource: verifyResource,
					resourcePath: translation.resourcePath,
				});

				expect(verifyValue).toEqual(translation.value);

				expect(verifyValue).toEqual(translate(translation.from, locale));
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
		}
	});
});
