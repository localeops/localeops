import type { Static } from "@sinclair/typebox";

import type { PostTranslationSchema } from "./translation.schema";

export type PostTranslation = Static<typeof PostTranslationSchema>;
