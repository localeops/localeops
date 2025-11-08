import { config } from "../config/config";
import type { Routes } from "../transports";
import { createTransport } from "../transports";
import {
	getUntranslatedHandler,
	postTranslationsHandler,
} from "./modules/translation/translation.controller";

const routes: Routes = {
	[config.transport.adapter.route]: async (request) => {
		if (request.method === "GET") {
			return await getUntranslatedHandler(request);
		}
		if (request.method === "POST") {
			return await postTranslationsHandler(request);
		}
		return new Response("Method Not Allowed", { status: 405 });
	},
};

const transport = await createTransport(config.transport, routes);
await transport.start();
