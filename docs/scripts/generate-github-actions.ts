#!/usr/bin/env bun

/**
 * Generate GitHub Actions examples documentation
 *
 * Parses workflow files from examples/actions/source/ and generates
 * .mdx files in src/content/docs/examples
 *
 * Expected header format in workflow files:
 * # =============================================================================
 * # Title
 * # =============================================================================
 * # Description paragraph(s)...
 * #
 * # Section:
 * # - Item 1
 * # =============================================================================
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

interface Section {
	name: string;
	content: string[];
}

interface Example {
	filename: string;
	title: string;
	description: string;
	sections: Section[];
	code: string;
}

// Precompiled regexes
const SEPARATOR_RE = /={10,}/;
const SECTION_HEADER_RE = /^([A-Z][^:]+):$/;
const CODE_LIKE_RE = /^[\s]*[{[\]}"]|^\s{2,}/;
const LIST_ITEM_RE = /^(-|\d+\.)\s/;
const BRACE_RE = /[{}]/g;

const escapeMdx = (s: string) => s.replace(BRACE_RE, "\\$&");
const trimArray = (arr: string[]) => {
	let start = 0,
		end = arr.length;
	while (start < end && !arr[start]) start++;
	while (end > start && !arr[end - 1]) end--;
	return arr.slice(start, end);
};

function parseHeader(content: string): {
	title: string;
	description: string;
	sections: Section[];
	codeStart: number;
} {
	const lines = content.split("\n");
	let title = "",
		separators = 0,
		inCodeBlock = false;
	const descLines: string[] = [],
		sections: Section[] = [];
	let current: Section | null = null;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (SEPARATOR_RE.test(line)) {
			if (++separators === 3)
				return {
					title,
					description: descLines.join(" ").trim(),
					sections: current ? [...sections, current] : sections,
					codeStart: i + 1,
				};
			continue;
		}
		if (separators < 1) continue;

		const stripped = line.replace(/^#\s?/, "");
		const trimmed = stripped.trim();

		if (separators === 1) {
			if (!title && trimmed) title = trimmed.replace(/^LocaleOps\s+/i, "");
			continue;
		}

		// separators === 2: body content
		if (trimmed.startsWith("```")) {
			inCodeBlock = !inCodeBlock;
			current?.content.push(trimmed);
			continue;
		}

		if (inCodeBlock) {
			current?.content.push(stripped);
			continue;
		}

		if (!trimmed) {
			if (current?.content.length) current.content.push("");
			continue;
		}

		const match = trimmed.match(SECTION_HEADER_RE);
		if (match) {
			if (current) sections.push(current);
			current = { name: match[1], content: [] };
			continue;
		}

		const text = CODE_LIKE_RE.test(stripped) ? stripped : trimmed;
		current ? current.content.push(text) : descLines.push(trimmed);
	}

	return {
		title,
		description: descLines.join(" ").trim(),
		sections: current ? [...sections, current] : sections,
		codeStart: lines.length,
	};
}

function wrapJson(lines: string[]): string[] {
	const result: string[] = [];
	let depth = 0,
		jsonBuf: string[] = [];

	for (const line of lines) {
		const t = line.trim();
		if (!depth && (t[0] === "{" || t[0] === "[")) {
			jsonBuf = [line];
			depth =
				(line.match(/[{[]/g)?.length ?? 0) -
				(line.match(/[}\]]/g)?.length ?? 0);
			if (!depth) result.push("```json", ...jsonBuf, "```");
			continue;
		}
		if (depth) {
			jsonBuf.push(line);
			depth +=
				(line.match(/[{[]/g)?.length ?? 0) -
				(line.match(/[}\]]/g)?.length ?? 0);
			if (depth <= 0) {
				result.push("```json", ...jsonBuf, "```");
				depth = 0;
			}
			continue;
		}
		result.push(line);
	}
	if (depth && jsonBuf.length) result.push("```json", ...jsonBuf, "```");
	return result;
}

function formatSections(sections: Section[]): string {
	return sections
		.map(({ name, content }) => {
			const lines = trimArray(content);
			if (!lines.length) return "";

			const hasCodeFence = lines.some((l) => l.trim().startsWith("```"));
			let body: string;

			if (hasCodeFence) {
				body = lines.join("\n");
			} else if (lines.every((l) => !l || LIST_ITEM_RE.test(l))) {
				body = lines.map(escapeMdx).join("\n");
			} else if (lines.find((l) => l.trim())?.[0]?.match(/[{[]/)) {
				body = wrapJson(lines).join("\n");
			} else {
				body = escapeMdx(lines.join(" "));
			}

			return `**${name}:**\n${body}`;
		})
		.filter(Boolean)
		.join("\n\n");
}

function generateMDX(
	examples: Example[],
	docTitle: string,
	docDescription: string,
	sourceDir: string,
): string {
	const header = `---
title: ${docTitle}
description: ${docDescription}
---

{/* AUTO-GENERATED FROM ${sourceDir} - DO NOT EDIT */}

Copy these pipeline files and customize as needed.

`;

	return (
		header +
		examples
			.map(({ title, description, sections, filename, code }) => {
				const body = [escapeMdx(description), formatSections(sections)]
					.filter(Boolean)
					.join("\n\n");
				return `## ${title}\n\n${body}\n\n\`\`\`yaml title="${filename}"\n${code}\n\`\`\`\n`;
			})
			.join("\n---\n\n")
	);
}

const DOCUMENTS = [
	{
		directory: "github",
		title: "GitHub Actions",
		description: "Ready-to-use GitHub Actions workflows for LocaleOps",
	},
	{
		directory: "gitlab",
		title: "GitLab CI",
		description: "Ready-to-use GitLab CI pipelines for LocaleOps",
	},
	{
		directory: "bitbucket",
		title: "Bitbucket Pipelines",
		description: "Ready-to-use Bitbucket Pipelines for LocaleOps",
	},
];

async function main() {
	const actionsDir = join(process.cwd(), "../examples/actions");

	for await (const document of DOCUMENTS) {
		const dir = join(actionsDir, document.directory);
		const outputPath = `src/content/docs/examples/${document.directory}-ci.mdx`;

		console.log("📂 Scanning:", dir);

		let files: string[];
		try {
			files = (await readdir(dir)).filter((f) => /\.ya?ml$/.test(f)).sort();
		} catch {
			console.error(
				`❌ Could not read: ${dir}\n\nUsage: bun generate-github-actions.ts [examples-dir] [output-path] [doc-title] [code-path]`,
			);
			process.exit(1);
		}

		console.log(`📄 Found ${files.length} pipeline files\n`);

		const examples: Example[] = await Promise.all(
			files.map(async (filename) => {
				const content = await readFile(join(dir, filename), "utf-8");
				const { title, description, sections, codeStart } =
					parseHeader(content);
				const code = content.split("\n").slice(codeStart).join("\n").trim();

				console.log(`✅ ${filename} → ${title || "(no title)"}`);
				return {
					filename,
					title: title || filename.replace(/\.ya?ml$/, ""),
					description,
					sections,
					code,
				};
			}),
		);

		examples.sort((a, b) => a.title.localeCompare(b.title));

		await writeFile(
			join(process.cwd(), outputPath),
			generateMDX(
				examples,
				document.title,
				document.description,
				document.directory,
			),
		);

		console.log(`\n✨ Generated: ${outputPath}`);
	}
}

main().catch(console.error);
