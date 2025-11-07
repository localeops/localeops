/**
 * Base class for transport adapters that handle communication protocols
 */
export abstract class BaseTransport {
	/**
	 * Start the transport (server, listener, etc.)
	 * Called once during application startup
	 */
	abstract start(): Promise<void>;

	/**
	 * Stop the transport and cleanup resources
	 * Called during graceful shutdown
	 */
	abstract stop(): Promise<void>;

	/**
	 * Authenticate incoming requests/connections
	 * Returns true if authenticated, false otherwise
	 * @param context - Transport-specific context (e.g., HTTP headers, WebSocket handshake)
	 */
	protected abstract authenticate(context: unknown): Promise<boolean>;
}
