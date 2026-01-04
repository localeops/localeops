import en from "./locales/en.json";
import es from "./locales/es.json";

export const messages = {
	en,
	es,
};

export type Locale = keyof typeof messages;

export const defaultLocale: Locale = "en";
