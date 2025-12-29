import type { Config } from "../config/config";
import { FrameworkError } from "../core/errors";
import type { BaseFramework } from "./base/base.framework";
import { FormatjsFramework } from "./formatjs/formatjs.framework";
import { I18nextFramework } from "./i18next/i18next.framework";

export const createFramework = (
	config: Config["framework"],
): BaseFramework<unknown> => {
	const name = config.name;

	if (name === "i18next") {
		return new I18nextFramework(config);
	}

	if (name === "formatjs") {
		return new FormatjsFramework(config);
	}

	const _exhaustive: never = name;

	throw new FrameworkError(
		`Unknown framework: ${(_exhaustive as { name: string }).name}\nPlease check configuration file.`,
	);
};
