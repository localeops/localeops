// @ts-check

import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	site: "https://localeops.com",
	integrations: [
		starlight({
			title: "LocaleOps",
			social: [
				{
					icon: "github",
					label: "GitHub",
					href: "https://github.com/localeops/localeops",
				},
			],
			sidebar: [
				{
					label: "Start Here",
					items: [
						{ label: "Introduction", link: "/" },
						{ label: "Motivation", link: "/motivation" },
						{ label: "Architecture", link: "/architecture" },
					],
				},
				{
					label: "Examples",
					autogenerate: { directory: "examples" },
				},
			],
		}),
	],
});
