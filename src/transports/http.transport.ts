import type { Server } from "bun";
import type { Config } from "../config/config";
import { BaseTransport } from "./base.transport";

type HttpTransportConfig = Extract<
	Config["transport"]["adapter"],
	{ name: "http" }
>;

type RouteHandler = (request: Request) => Response | Promise<Response>;
type Routes = Record<string, RouteHandler>;

export class HttpTransport extends BaseTransport {
	private server: Server<undefined> | null = null;
	private httpConfig: HttpTransportConfig;
	private routes: Routes;

	constructor(config: unknown, routes: Routes) {
		super(config);
		this.routes = routes;
		this.httpConfig = config as HttpTransportConfig;
	}

	async start(): Promise<void> {
		this.server = Bun.serve({
			port: this.httpConfig.port,
			development: process.env.NODE_ENV !== "production",
			fetch: async (request) => {
				const isAuthenticated = await this.authenticate(request);
				if (!isAuthenticated) {
					return new Response("Unauthorized", { status: 401 });
				}

				const url = new URL(request.url);
				const handler = this.routes[url.pathname];

				if (handler) {
					return await handler(request);
				}

				return new Response("Not Found", { status: 404 });
			},
		});

		console.log(`HTTP transport listening on port ${this.httpConfig.port}`);
	}

	async stop(): Promise<void> {
		if (this.server) {
			this.server.stop();
			this.server = null;
			console.log("HTTP transport stopped");
		}
	}

	protected async authenticate(context: Request): Promise<boolean> {
		if (this.httpConfig.auth.type === "none") {
			return true;
		}

		if (this.httpConfig.auth.type === "bearer") {
			const authHeader = context.headers.get("Authorization");
			return authHeader === `Bearer ${this.httpConfig.auth.token}`;
		}

		return false;
	}
}
