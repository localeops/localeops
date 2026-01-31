#!/usr/bin/env bun

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const DOCUMENTS = [
	{
		file: "sources.base.source.md",
		title: "BaseSource Class",
		page: "base-source",
	},
	{
		file: "databases.base.database.md",
		title: "BaseDatabase Class",
		page: "base-database",
	},
	{
		file: "framework.base.base.framework.md",
		title: "BaseFramework Class",
		page: "base-framework",
	},
];

async function main() {
	const actionsDir = join(process.cwd(), ".typedoc");

	for await (const document of DOCUMENTS) {
		const outputPath = `src/content/docs/api/${document.page}.mdx`;

		const header = `---
title: ${document.title}
---

{/* AUTO-GENERATED - DO NOT EDIT */}

`;

		const content = await readFile(join(actionsDir, document.file), "utf-8");

		// Replace TypeDoc generated internal links to use the correct paths
		const newContent = content
			.replaceAll("sources.base.source.md", `base-source`)
			.replaceAll("databases.base.database.md", `base-database`)
			.replaceAll("framework.base.base.framework.md", `base-framework`);

		await writeFile(join(process.cwd(), outputPath), header + newContent);

		console.log(`\n✨ Generated: ${outputPath}`);
	}
}

main().catch(console.error);
