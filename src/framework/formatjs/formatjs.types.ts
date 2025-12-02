import type { Static } from "@sinclair/typebox";
import type { FormatjsResourceSchema } from "./formatjs.schema";

export type FormatjsResource = Static<typeof FormatjsResourceSchema>;
