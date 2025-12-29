export class ConfigError extends Error {
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = "ConfigError";
	}
}

export class FrameworkError extends Error {
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = "FrameworkError";
	}
}

export class DatabaseError extends Error {
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = "DatabaseError";
	}
}

export class SourceError extends Error {
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = "SourceError";
	}
}
