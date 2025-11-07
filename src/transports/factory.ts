import type { Config } from "../config/config";
import type { BaseTransport } from "./base.transport";
import { HttpTransport } from "./http.transport";

type RouteHandler = (request: Request) => Response | Promise<Response>;
type Routes = Record<string, RouteHandler>;

export const createTransport = async (
	transportConfig: Config["transport"],
	handler: unknown,
): Promise<BaseTransport> => {
	const adapter = transportConfig.adapter;

	if (adapter.name === "http") {
		return new HttpTransport(adapter, handler as Routes);
	}

	// Future: custom transport
	// if (adapter.name === "custom") {
	// 	const module = await import(adapter.path);
	// 	const TransportClass = module.default || module;
	// 	return new TransportClass(adapter, handler);
	// }

	throw new Error(`Unknown transport adapter: ${adapter.name}`);
};

export type { Routes, RouteHandler };
