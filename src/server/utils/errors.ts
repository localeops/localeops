export enum ERROR_TYPES {
	STALE_TRANSLATION = "STALE TRANSLATION",
}

export class AppError extends Error {
	override message: string;
	type: ERROR_TYPES;

	constructor({ type, message }: { type: ERROR_TYPES; message: string }) {
		super(message);
		this.type = type;
		this.message = message;
	}
}
