import { expect, test, describe } from "bun:test";
import { StateManager, type DiffChange } from "./StateManager";

describe("StateManager.diff", () => {
	test("returns empty list when documents are identical", () => {
		const s = new StateManager();
		const doc = { a: 1, b: { c: 2 }, d: [1, 2, 3] };
		const received = s.diff(doc, JSON.parse(JSON.stringify(doc)));
		// No changes should be reported when objects are deeply equal
		expect(received).toHaveLength(0);
	});

	test("throws when roots are not plain objects", () => {
		const s = new StateManager();
		// Root-level inputs must be plain objects
		expect(() => s.diff(null as unknown as object, {})).toThrow(TypeError);
		expect(() => s.diff({}, null as unknown as object)).toThrow(TypeError);
		expect(() => s.diff([], {})).toThrow(TypeError);
		expect(() => s.diff({}, [])).toThrow(TypeError);
	});

	test("added new field to empty object", () => {
		const s = new StateManager();
		const oldState = {};
		const newState = { a: { a1: "A" } };
		const received = s.diff(oldState, newState);

		const expected: DiffChange[] = [
			{ type: "added", leafPath: ["a"], path: ["a", "a1"], key: "a1", value: "A" },
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("added new field with primitive value", () => {
		const s = new StateManager();
		const oldState = { a: [{ a1: [{ a11: "A" }] }] };
		const newState = { a: [{ a1: [{ a11: "A", a12: "B" }] }] };
		const received = s.diff(oldState, newState);

		const expected: DiffChange[] = [
			{ type: "added", leafPath: ["a", 0, "a1", 0], path: ["a", 0, "a1", 0, "a12"], key: "a12", value: "B" },
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("added new field with object value", () => {
		const s = new StateManager();
		const oldState = { a: { a1: "A" } };
		const newState = { a: { a1: "A", a2: [{ a21: "B", a22: "C" }] } };
		const received = s.diff(oldState, newState);

		const expected: DiffChange[] = [
			{ type: "added", leafPath: ["a", "a2", 0], path: ["a", "a2", 0, "a21"], key: "a21", value: "B" },
			{ type: "added", leafPath: ["a", "a2", 0], path: ["a", "a2", 0, "a22"], key: "a22", value: "C" },
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("changed a field to primitive value", () => {
		const s = new StateManager();
		const oldState = { a: { a1: ["A", "C"] } };
		const newState = { a: { a1: ["B", "C"] } };
		const received = s.diff(oldState, newState);

		const expected: DiffChange[] = [
			{ type: "changed", leafPath: ["a", "a1"], path: ["a", "a1", 0], key: 0, oldValue: "A", newValue: "B" },
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("changed a field to object value", () => {
		const s = new StateManager();
		const oldState = { a: { a1: "A" } };
		const newState = { a: { a1: { a11: ["B"], a12: { a121: "C" } } } };
		const received = s.diff(oldState, newState);

		const expected: DiffChange[] = [
			{ type: "added", leafPath: ["a", "a1", "a11"], path: ["a", "a1", "a11", 0], key: 0, value: "B" },
			{ type: "added", leafPath: ["a", "a1", "a12"], path: ["a", "a1", "a12", "a121"], key: "a121", value: "C" },
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("removed field with primitive value", () => {
		const s = new StateManager();
		const oldState = { a: "A", b: ["B1"], c: { c1: { c11: "C11", c12: "C12" } }};
		const newState = { a: "A", c: { c1: { c11: "C11" } } };
		const received = s.diff(oldState, newState);

		const expected: DiffChange[] = [
			{ type: "removed", leafPath: ["b"], path: ["b", 0], key: 0 },
			{ type: "removed", leafPath: ["c", "c1"], path: ["c", "c1", "c12"], key: "c12" },
		];

		expect(received).toHaveLength(expected.length);
		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("removed field with object value", () => {
		const s = new StateManager();
		const oldState = { a: "A", b: [{ b1: "B1", b2: "B2"}], };
		const newState = { a: "A" };
		const received = s.diff(oldState, newState);

		const expected: DiffChange[] = [
			{ type: "removed", leafPath: ["b", 0], path: ["b", 0, "b1"], key: "b1" },
			{ type: "removed", leafPath: ["b", 0], path: ["b", 0, "b2"], key: "b2" },
		];

		expect(received).toHaveLength(expected.length);
		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("changed field from object to primitive", () => {
		const s = new StateManager();
		const oldState = { node: { x: 1 } };
		const newState = { node: 42 };
		const received = s.diff(oldState, newState);

		const expected: DiffChange[] = [
			{ type: "removed", path: ["node", "x"], leafPath: ["node"], key: "x" },
			{ type: "added", path: ["node"], leafPath: [], key: "node", value: 42 },
		];

		expect(received).toHaveLength(2);
		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("change element in array field", () => {
		const s = new StateManager();
		const oldState = {a: ["A", "B", "C"]};
		const newState = {a: ["A", "X", "B", "C"]};
		const received = s.diff(oldState, newState);

		const expected: DiffChange[] = [
			{ type: "changed", leafPath: ["a"], path: ["a", 1], key: 1, oldValue: "B", newValue: "X" },
			{ type: "changed", leafPath: ["a"], path: ["a", 2], key: 2, oldValue: "C", newValue: "B" },
			{ type: "added", leafPath: ["a"], path: ["a", 3], key: 3, value: "C" },
		];

		expect(received).toHaveLength(expected.length);
		expect(received).toEqual(expect.arrayContaining(expected));
	});
});