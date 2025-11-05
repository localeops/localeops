import { Value } from "@sinclair/typebox/value";
import { AppError, ERROR_TYPES } from "../../utils/errors";
import { PostTranslationsDto } from "./translation.schema";
import { TranslationService } from "./translation.service";

export const postTranslationsHandler = async (
	req: Request,
): Promise<Response> => {
	const body = await req.json();

	if (!Value.Check(PostTranslationsDto, body)) {
		return new Response("Invalid payload", { status: 400 });
	}

	const { locale, translations } = body;

	try {
		const translationService = new TranslationService(locale);
		await translationService.postTranslations(translations);
	} catch (error) {
		if (error instanceof Error) {
			if (error instanceof AppError) {
				if (error.type === ERROR_TYPES.STALE_TRANSLATION) {
					return new Response(error.message, {
						status: 400,
					});
				}
			}

			return new Response(error.message, { status: 500 });
		}

		return new Response("Internal Server Error", { status: 500 });
	}

	return new Response("OK");
};

export const getUntranslatedHandler = async (
	req: Request,
): Promise<Response> => {
	const url = new URL(req.url);

	const locale = url.searchParams.get("locale");

	if (!locale) return new Response("Missing locale param", { status: 400 });

	const translationService = new TranslationService(locale);

	const deltas = await translationService.getUntranslatedDeltas();

	return new Response(JSON.stringify(deltas));
};
