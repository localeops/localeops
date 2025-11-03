import {
	getUntranslatedHandler,
	postTranslationsHandler,
} from "./translation.controller";

export default {
	GET: getUntranslatedHandler,
	POST: postTranslationsHandler,
};
