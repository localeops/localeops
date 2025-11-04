import type { Static } from "@sinclair/typebox/type";

import type { PostTranslationSchema } from "./translation.schema";

export type PostTranslation = Static<typeof PostTranslationSchema>;
