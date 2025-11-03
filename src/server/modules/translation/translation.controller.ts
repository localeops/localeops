import { Value } from "@sinclair/typebox/value";

import { PostTranslationsDto } from "./translation.schema";
import { getUntranslated, postTranslations } from "./translation.service";

export const postTranslationsHandler = async (
	req: Request,
): Promise<Response> => {
	const body = await req.json();

	if (!Value.Check(PostTranslationsDto, body)) {
		return new Response("Invalid payload", { status: 400 });
	}

	const { locale, translations } = body;

	await postTranslations({ locale, translations });

	return new Response("OK");
};

export const getUntranslatedHandler = async (
	req: Request,
): Promise<Response> => {
	const url = new URL(req.url);

	const locale = url.searchParams.get("locale");

	if (!locale) return new Response("Missing locale param", { status: 400 });

	const diff = await getUntranslated(locale);

	return new Response(JSON.stringify(diff));
};
