interface I18nextResourceObject {
	[k: string]: I18nextResourceValue;
}

export interface I18nextArray extends Array<I18nextResourceValue> {}

type I18nextResourceValue = string | I18nextResourceObject | I18nextArray;

export type I18nextResource = Record<string, I18nextResourceValue>;
