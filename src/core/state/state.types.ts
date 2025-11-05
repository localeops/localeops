import type { Static } from "@sinclair/typebox/type";
import type { TranslationSchema } from "./state.schema";

type Key = string | number;
type Path = Array<Key>;

/** Base structure for all delta types with path information */
type BaseDelta = {
	/** The specific key or array index that changed */
	key: string | number;
	/** Full path from root to the changed key */
	path: Path;
	/** Path to parent object (excludes the key itself) */
	leafPath: Path;
};

/** Delta representing a newly added value */
type AddedDelta = BaseDelta & {
	type: "added";
	value: string;
};

/** Delta representing a removed value */
export type RemovedDelta = BaseDelta & {
	type: "removed";
};

/** Delta representing a changed value */
type ChangedDelta = BaseDelta & {
	type: "changed";
	oldValue: string;
	newValue: string;
};

/** Represents any kind of diff change (added, removed, or changed) */
export type Delta = AddedDelta | RemovedDelta | ChangedDelta;

export interface I18nObject {
	[k: string]: I18nValue;
}

export interface I18nArray extends Array<I18nValue> {}

/** Represents i18n values */
export type I18nValue = string | I18nObject | I18nArray;
/** Represents i18n file format */
export type I18nResource = Record<string, I18nValue>;

export type Translation = Static<typeof TranslationSchema>;
