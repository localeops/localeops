/** Base structure for all delta types with path information */
type BaseDelta = {
	/** The specific key or array index that changed */
	key: string | number;
	/** Full path from root to the changed key */
	path: Array<string | number>;
	/** Path to parent object (excludes the key itself) */
	leafPath: Array<string | number>;
};

/** Delta representing a newly added value */
type AddedDelta = BaseDelta & {
	type: "added";
	value: unknown;
};

/** Delta representing a removed value */
type RemovedDelta = BaseDelta & {
	type: "removed";
};

/** Delta representing a changed value */
type ChangedDelta = BaseDelta & {
	type: "changed";
	oldValue: unknown;
	newValue: unknown;
};

/** Represents any kind of diff change (added, removed, or changed) */
export type Delta = AddedDelta | RemovedDelta | ChangedDelta;
