import { describe, expect, test } from "bun:test";
import { StateManager } from "./state-manager";
import type { Delta } from "./state-manager.types";

describe("StateManager.diffI18nResources", () => {
	test("returns empty list when documents are identical", () => {
		const s = new StateManager();
		const doc = { a: "1", b: { c: "2" }, d: ["1", "2", "3"] };
		const received = s.diffI18nResources({
			oldObj: doc,
			newObj: JSON.parse(JSON.stringify(doc)),
		});

		expect(received).toHaveLength(0);
	});

	test("throws when roots are not plain objects", () => {
		const s = new StateManager();
		expect(() => s.diffI18nResources({ oldObj: null, newObj: {} })).toThrow(
			TypeError,
		);
		expect(() => s.diffI18nResources({ oldObj: {}, newObj: null })).toThrow(
			TypeError,
		);
		expect(() => s.diffI18nResources({ oldObj: [], newObj: {} })).toThrow(
			TypeError,
		);
		expect(() => s.diffI18nResources({ oldObj: {}, newObj: [] })).toThrow(
			TypeError,
		);
	});

	// Object

	test("object: add primitive", () => {
		const s = new StateManager();
		const oldState = { a: "A" };
		const newState = { a: "A", b: "B" };

		const received = s.diffI18nResources({
			oldObj: oldState,
			newObj: newState,
		});

		const expected: Delta[] = [
			{
				type: "added",
				leafPath: [],
				path: ["b"],
				key: "b",
				value: "B",
			},
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("object: add array", () => {
		const s = new StateManager();
		const oldState = { a: "A" };
		const newState = { a: "A", b: ["B0", "B1"] };

		const received = s.diffI18nResources({
			oldObj: oldState,
			newObj: newState,
		});

		const expected: Delta[] = [
			{
				type: "added",
				leafPath: ["b"],
				path: ["b", 0],
				key: 0,
				value: "B0",
			},
			{
				type: "added",
				leafPath: ["b"],
				path: ["b", 1],
				key: 1,
				value: "B1",
			},
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("object: add object", () => {
		const s = new StateManager();
		const oldState = { a: "A" };
		const newState = { a: "A", b: { b1: "B1", b2: "B2" } };

		const received = s.diffI18nResources({
			oldObj: oldState,
			newObj: newState,
		});

		const expected: Delta[] = [
			{
				type: "added",
				leafPath: ["b"],
				path: ["b", "b1"],
				key: "b1",
				value: "B1",
			},
			{
				type: "added",
				leafPath: ["b"],
				path: ["b", "b2"],
				key: "b2",
				value: "B2",
			},
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("object: remove primitive", () => {
		const s = new StateManager();
		const oldState = { a: "A", b: "B" };
		const newState = { a: "A" };

		const received = s.diffI18nResources({
			oldObj: oldState,
			newObj: newState,
		});

		const expected: Delta[] = [
			{
				type: "removed",
				leafPath: [],
				path: ["b"],
				key: "b",
			},
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("object: remove array", () => {
		const s = new StateManager();
		const oldState = { a: "A", b: ["B0", "B1"] };
		const newState = { a: "A" };

		const received = s.diffI18nResources({
			oldObj: oldState,
			newObj: newState,
		});

		const expected: Delta[] = [
			{
				type: "removed",
				leafPath: ["b"],
				path: ["b", 0],
				key: 0,
			},
			{
				type: "removed",
				leafPath: ["b"],
				path: ["b", 1],
				key: 1,
			},
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("object: remove object", () => {
		const s = new StateManager();
		const oldState = { a: "A", b: { b1: "B1", b2: "B2" } };
		const newState = { a: "A" };

		const received = s.diffI18nResources({
			oldObj: oldState,
			newObj: newState,
		});

		const expected: Delta[] = [
			{
				type: "removed",
				leafPath: ["b"],
				path: ["b", "b1"],
				key: "b1",
			},
			{
				type: "removed",
				leafPath: ["b"],
				path: ["b", "b2"],
				key: "b2",
			},
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("object: primitive -> primitive", () => {
		const s = new StateManager();
		const oldState = { a: "A", b: "B" };
		const newState = { a: "A", b: "B_M" };

		const received = s.diffI18nResources({
			oldObj: oldState,
			newObj: newState,
		});

		const expected: Delta[] = [
			{
				type: "changed",
				leafPath: [],
				path: ["b"],
				key: "b",
				oldValue: "B",
				newValue: "B_M",
			},
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("object: primitive -> array", () => {
		const s = new StateManager();
		const oldState = { a: "A", b: "B" };
		const newState = { a: "A", b: ["B0", "B1"] };

		const received = s.diffI18nResources({
			oldObj: oldState,
			newObj: newState,
		});

		const expected: Delta[] = [
			{
				type: "added",
				leafPath: ["b"],
				path: ["b", 0],
				key: 0,
				value: "B0",
			},
			{
				type: "added",
				leafPath: ["b"],
				path: ["b", 1],
				key: 1,
				value: "B1",
			},
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("object: primitive -> object", () => {
		const s = new StateManager();
		const oldState = { a: "A", b: "B" };
		const newState = { a: "A", b: { b1: "B1", b2: "B2" } };

		const received = s.diffI18nResources({
			oldObj: oldState,
			newObj: newState,
		});

		const expected: Delta[] = [
			{
				type: "added",
				leafPath: ["b"],
				path: ["b", "b1"],
				key: "b1",
				value: "B1",
			},
			{
				type: "added",
				leafPath: ["b"],
				path: ["b", "b2"],
				key: "b2",
				value: "B2",
			},
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("object: array -> primitive", () => {
		const s = new StateManager();
		const oldState = { a: "A", b: ["B0", "B1"] };
		const newState = { a: "A", b: "B" };

		const received = s.diffI18nResources({
			oldObj: oldState,
			newObj: newState,
		});

		const expected: Delta[] = [
			{
				type: "changed",
				leafPath: [],
				path: ["b"],
				key: "b",
				oldValue: "",
				newValue: "B",
			},
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("object: array -> array", () => {
		const s = new StateManager();
		const oldState = { a: "A", b: ["B0", "B1"] };
		const newState = { a: "A", b: ["B0", "B1", "B2"] };

		const received = s.diffI18nResources({
			oldObj: oldState,
			newObj: newState,
		});

		const expected: Delta[] = [
			{
				type: "added",
				leafPath: ["b"],
				path: ["b", 2],
				key: 2,
				value: "B2",
			},
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("object: object -> primitive", () => {
		const s = new StateManager();
		const oldState = { a: "A", b: { b1: "B1", b2: "B2" } };
		const newState = { a: "A", b: "B" };

		const received = s.diffI18nResources({
			oldObj: oldState,
			newObj: newState,
		});

		const expected: Delta[] = [
			{
				type: "removed",
				leafPath: ["b"],
				path: ["b", "b1"],
				key: "b1",
			},
			{
				type: "removed",
				leafPath: ["b"],
				path: ["b", "b2"],
				key: "b2",
			},
			{
				type: "changed",
				leafPath: [],
				path: ["b"],
				key: "b",
				oldValue: "",
				newValue: "B",
			},
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("object: object -> array", () => {
		const s = new StateManager();
		const oldState = { a: "A", b: { b1: "B1", b2: "B2" } };
		const newState = { a: "A", b: ["B0", "B1"] };

		const received = s.diffI18nResources({
			oldObj: oldState,
			newObj: newState,
		});

		const expected: Delta[] = [
			{
				type: "added",
				leafPath: ["b"],
				path: ["b", 0],
				key: 0,
				value: "B0",
			},
			{
				type: "added",
				leafPath: ["b"],
				path: ["b", 1],
				key: 1,
				value: "B1",
			},
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("object: object -> object", () => {
		const s = new StateManager();
		const oldState = { a: "A", b: { b1: "B1", b2: "B2" } };
		const newState = { a: "A", b: { b1: "B1", b2: "B2", b3: "B3" } };

		const received = s.diffI18nResources({
			oldObj: oldState,
			newObj: newState,
		});

		const expected: Delta[] = [
			{
				type: "added",
				leafPath: ["b"],
				path: ["b", "b3"],
				key: "b3",
				value: "B3",
			},
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});

	// Array

	test("array: add primitive", () => {
		const s = new StateManager();
		const oldState = { a: "A", b: ["B0"] };
		const newState = { a: "A", b: ["B0", "B1"] };

		const received = s.diffI18nResources({
			oldObj: oldState,
			newObj: newState,
		});

		const expected: Delta[] = [
			{
				type: "added",
				leafPath: ["b"],
				path: ["b", 1],
				key: 1,
				value: "B1",
			},
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("array: add array", () => {
		const s = new StateManager();
		const oldState = { a: "A", b: ["B0"] };
		const newState = { a: "A", b: ["B0", ["C"]] };

		const received = s.diffI18nResources({
			oldObj: oldState,
			newObj: newState,
		});

		const expected: Delta[] = [
			{
				type: "added",
				leafPath: ["b", 1],
				path: ["b", 1, 0],
				key: 0,
				value: "C",
			},
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("array: add object", () => {
		const s = new StateManager();
		const oldState = { a: "A", b: ["B0"] };
		const newState = { a: "A", b: ["B0", { c: "C" }] };

		const received = s.diffI18nResources({
			oldObj: oldState,
			newObj: newState,
		});

		const expected: Delta[] = [
			{
				type: "added",
				leafPath: ["b", 1],
				path: ["b", 1, "c"],
				key: "c",
				value: "C",
			},
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("array: remove primitive", () => {
		const s = new StateManager();
		const oldState = { a: "A", b: ["B0", "B1"] };
		const newState = { a: "A", b: ["B0"] };

		const received = s.diffI18nResources({
			oldObj: oldState,
			newObj: newState,
		});

		const expected: Delta[] = [
			{
				type: "removed",
				leafPath: ["b"],
				path: ["b", 1],
				key: 1,
			},
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("array: remove array", () => {
		const s = new StateManager();
		const oldState = { a: "A", b: ["B0", ["C1", "C2"]] };
		const newState = { a: "A", b: ["B0"] };

		const received = s.diffI18nResources({
			oldObj: oldState,
			newObj: newState,
		});

		const expected: Delta[] = [
			{
				type: "removed",
				leafPath: ["b", 1],
				path: ["b", 1, 0],
				key: 0,
			},
			{
				type: "removed",
				leafPath: ["b", 1],
				path: ["b", 1, 1],
				key: 1,
			},
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("array: remove object", () => {
		const s = new StateManager();
		const oldState = { a: "A", b: ["B0", { c: "C" }] };
		const newState = { a: "A", b: ["B0"] };

		const received = s.diffI18nResources({
			oldObj: oldState,
			newObj: newState,
		});

		const expected: Delta[] = [
			{
				type: "removed",
				leafPath: ["b", 1],
				path: ["b", 1, "c"],
				key: "c",
			},
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("array: primitive -> primitive", () => {
		const s = new StateManager();
		const oldState = { a: "A", b: ["B0"] };
		const newState = { a: "A", b: ["B0_M"] };

		const received = s.diffI18nResources({
			oldObj: oldState,
			newObj: newState,
		});

		const expected: Delta[] = [
			{
				type: "changed",
				leafPath: ["b"],
				path: ["b", 0],
				key: 0,
				oldValue: "B0",
				newValue: "B0_M",
			},
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("array: primitive -> array", () => {
		const s = new StateManager();
		const oldState = { a: "A", b: ["B0", "B1"] };
		const newState = { a: "A", b: ["B0", ["C0", "C1"]] };

		const received = s.diffI18nResources({
			oldObj: oldState,
			newObj: newState,
		});

		const expected: Delta[] = [
			{
				type: "added",
				leafPath: ["b", 1],
				path: ["b", 1, 0],
				key: 0,
				value: "C0",
			},
			{
				type: "added",
				leafPath: ["b", 1],
				path: ["b", 1, 1],
				key: 1,
				value: "C1",
			},
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("array: primitive -> object", () => {
		const s = new StateManager();
		const oldState = { a: "A", b: ["B0", "B1"] };
		const newState = { a: "A", b: ["B0", { c: "C" }] };

		const received = s.diffI18nResources({
			oldObj: oldState,
			newObj: newState,
		});

		const expected: Delta[] = [
			{
				type: "added",
				leafPath: ["b", 1],
				path: ["b", 1, "c"],
				key: "c",
				value: "C",
			},
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("array: array -> primitive", () => {
		const s = new StateManager();
		const oldState = { a: "A", b: ["B0", "B1"] };
		const newState = { a: "A", b: "B" };

		const received = s.diffI18nResources({
			oldObj: oldState,
			newObj: newState,
		});

		const expected: Delta[] = [
			{
				type: "changed",
				leafPath: [],
				path: ["b"],
				key: "b",
				oldValue: "",
				newValue: "B",
			},
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("array: array -> array", () => {
		const s = new StateManager();
		const oldState = { a: "A", b: ["C", "D"] };
		const newState = { a: "A", b: ["D", "C"] };

		const received = s.diffI18nResources({
			oldObj: oldState,
			newObj: newState,
		});

		const expected: Delta[] = [
			{
				type: "changed",
				leafPath: ["b"],
				path: ["b", 0],
				key: 0,
				oldValue: "C",
				newValue: "D",
			},
			{
				type: "changed",
				leafPath: ["b"],
				path: ["b", 1],
				key: 1,
				oldValue: "D",
				newValue: "C",
			},
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("array: object -> primitive", () => {
		const s = new StateManager();
		const oldState = { a: "A", b: ["B0", { c: "C" }] };
		const newState = { a: "A", b: ["B0", "B1"] };

		const received = s.diffI18nResources({
			oldObj: oldState,
			newObj: newState,
		});

		const expected: Delta[] = [
			{
				type: "changed",
				leafPath: ["b"],
				path: ["b", 1],
				key: 1,
				oldValue: "",
				newValue: "B1",
			},
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("array: object -> array", () => {
		const s = new StateManager();
		const oldState = { a: "A", b: ["B0", { c: "C" }] };
		const newState = { a: "A", b: ["B0", ["C0", "C1"]] };

		const received = s.diffI18nResources({
			oldObj: oldState,
			newObj: newState,
		});

		const expected: Delta[] = [
			{
				type: "added",
				leafPath: ["b", 1],
				path: ["b", 1, 0],
				key: 0,
				value: "C0",
			},
			{
				type: "added",
				leafPath: ["b", 1],
				path: ["b", 1, 1],
				key: 1,
				value: "C1",
			},
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});

	test("array: object -> object", () => {
		const s = new StateManager();
		const oldState = { a: "A", b: ["B0", { c: "C" }] };
		const newState = { a: "A", b: ["B0", { c: "C", d: "D" }] };

		const received = s.diffI18nResources({
			oldObj: oldState,
			newObj: newState,
		});

		const expected: Delta[] = [
			{
				type: "added",
				leafPath: ["b", 1],
				path: ["b", 1, "d"],
				key: "d",
				value: "D",
			},
		];

		expect(received).toEqual(expect.arrayContaining(expected));
	});
});

describe("StateManager.updateI18nResources", () => {
	// Object

	test("object: new primitive", () => {
		const s = new StateManager();
		const state = { a: "A" };

		const received = s.updateI18nResources({
			state,
			translatations: [{ path: ["b"], value: "B" }],
		});

		const expected = { a: "A", b: "B" };

		expect(received).toEqual(expected);
	});

	test("object: new array", () => {
		const s = new StateManager();
		const state = { a: "A" };

		const received = s.updateI18nResources({
			state,
			translatations: [
				{ path: ["b", 0], value: "B0" },
				{ path: ["b", 1], value: "B1" },
			],
		});

		const expected = { a: "A", b: ["B0", "B1"] };

		expect(received).toEqual(expected);
	});

	test("object: add object", () => {
		const s = new StateManager();
		const state = { a: "A" };

		const received = s.updateI18nResources({
			state,
			translatations: [
				{ path: ["b", "b1"], value: "B1" },
				{ path: ["b", "b2"], value: "B2" },
			],
		});

		const expected = { a: "A", b: { b1: "B1", b2: "B2" } };

		expect(received).toEqual(expected);
	});

	test("object: primitive -> primitive", () => {
		const s = new StateManager();
		const state = { a: "A" };

		const received = s.updateI18nResources({
			state,
			translatations: [{ path: ["a"], value: "A_M" }],
		});

		const expected = { a: "A_M" };

		expect(received).toEqual(expected);
	});

	test("object: primitive -> array", () => {
		const s = new StateManager();
		const state = { a: "A" };

		const received = s.updateI18nResources({
			state,
			translatations: [
				{ path: ["a", 0], value: "A0" },
				{ path: ["a", 1], value: "A1" },
			],
		});

		const expected = { a: ["A0", "A1"] };

		expect(received).toEqual(expected);
	});

	test("object: primitive -> object", () => {
		const s = new StateManager();
		const state = { a: "A" };

		const received = s.updateI18nResources({
			state,
			translatations: [
				{ path: ["a", "a1"], value: "A1" },
				{ path: ["a", "a2"], value: "A2" },
			],
		});

		const expected = { a: { a1: "A1", a2: "A2" } };

		expect(received).toEqual(expected);
	});

	test("object: array -> primitive", () => {
		const s = new StateManager();
		const state = { a: ["A0", "A1"] };

		const received = s.updateI18nResources({
			state,
			translatations: [{ path: ["a"], value: "A" }],
		});

		const expected = { a: "A" };

		expect(received).toEqual(expected);
	});

	test("object: array -> array", () => {
		const s = new StateManager();
		const state = { a: ["A0", "A1"] };

		const received = s.updateI18nResources({
			state,
			translatations: [{ path: ["a", 0], value: "A0_M" }],
		});

		const expected = { a: ["A0_M", "A1"] };

		expect(received).toEqual(expected);
	});

	test("object: object -> primitive", () => {
		const s = new StateManager();
		const state = { a: { a1: "A1", a2: "A2" } };

		const received = s.updateI18nResources({
			state,
			translatations: [{ path: ["a"], value: "A" }],
		});

		const expected = { a: "A" };

		expect(received).toEqual(expected);
	});

	test("object: object -> array", () => {
		const s = new StateManager();
		const state = { a: { a1: "A1", a2: "A2" } };

		const received = s.updateI18nResources({
			state,
			translatations: [
				{ path: ["a", 0], value: "A0" },
				{ path: ["a", 1], value: "A1" },
			],
		});

		const expected = { a: ["A0", "A1"] };

		expect(received).toEqual(expected);
	});

	test("object: object -> nested array", () => {
		const s = new StateManager();
		const state = { a: { a1: "A1", a2: "A2" } };

		const received = s.updateI18nResources({
			state,
			translatations: [
				{ path: ["a", 1], value: "A1" },
				{ path: ["a", 0, 0], value: "A00" },
				{ path: ["a", 0, 1], value: "A01" },
			],
		});

		const expected = { a: [["A00", "A01"], "A1"] };

		expect(received).toEqual(expected);
	});

	// Array

	test("array: new primitive", () => {
		const s = new StateManager();
		const state = { a: [["A0", "A1"]] };

		const received = s.updateI18nResources({
			state,
			translatations: [{ path: ["a", 0, 2], value: "A2" }],
		});

		const expected = { a: [["A0", "A1", "A2"]] };

		expect(received).toEqual(expected);
	});

	test("array: new array", () => {
		const s = new StateManager();
		const state = { a: [["A0", "A1"]] };

		const received = s.updateI18nResources({
			state,
			translatations: [
				{ path: ["a", 0, 2, 0], value: "A20" },
				{ path: ["a", 0, 2, 1], value: "A21" },
			],
		});

		const expected = { a: [["A0", "A1", ["A20", "A21"]]] };

		expect(received).toEqual(expected);
	});

	test("array: new object", () => {
		const s = new StateManager();
		const state = { a: [["A0", "A1"]] };

		const received = s.updateI18nResources({
			state,
			translatations: [
				{ path: ["a", 0, 2, "b"], value: "B" },
				{ path: ["a", 0, 2, "c"], value: "C" },
			],
		});

		const expected = { a: [["A0", "A1", { b: "B", c: "C" }]] };

		expect(received).toEqual(expected);
	});

	test("array: primitive -> primitive", () => {
		const s = new StateManager();
		const state = { a: [["A0", "A1"]] };

		const received = s.updateI18nResources({
			state,
			translatations: [
				{ path: ["a", 0, 0], value: "A0_M" },
				{ path: ["a", 0, 1], value: "A1_M" },
			],
		});

		const expected = { a: [["A0_M", "A1_M"]] };

		expect(received).toEqual(expected);
	});

	test("array: primitive -> array", () => {
		const s = new StateManager();
		const state = { a: [["A0", "A1"]] };

		const received = s.updateI18nResources({
			state,
			translatations: [
				{ path: ["a", 0, 1, 0], value: "A10" },
				{ path: ["a", 0, 1, 1], value: "A11" },
			],
		});

		const expected = { a: [["A0", ["A10", "A11"]]] };

		expect(received).toEqual(expected);
	});

	test("array: primitive -> object", () => {
		const s = new StateManager();
		const state = { a: [["A0", "A1"]] };

		const received = s.updateI18nResources({
			state,
			translatations: [
				{ path: ["a", 0, 1, "b"], value: "B" },
				{ path: ["a", 0, 1, "c"], value: "C" },
			],
		});

		const expected = { a: [["A0", { b: "B", c: "C" }]] };

		expect(received).toEqual(expected);
	});

	test("array: array -> primitive", () => {
		const s = new StateManager();
		const state = { a: [["A0", ["A10", "A11"]]] };

		const received = s.updateI18nResources({
			state,
			translatations: [{ path: ["a", 0, 1], value: "A1" }],
		});

		const expected = { a: [["A0", "A1"]] };

		expect(received).toEqual(expected);
	});

	test("array: object -> primitive", () => {
		const s = new StateManager();
		const state = { a: [["A0", { b: "B" }]] };

		const received = s.updateI18nResources({
			state,
			translatations: [{ path: ["a", 0, 1], value: "A1" }],
		});

		const expected = { a: [["A0", "A1"]] };

		expect(received).toEqual(expected);
	});

	test("array: object -> array", () => {
		const s = new StateManager();
		const state = { a: [["A0", { b: "B" }]] };

		const received = s.updateI18nResources({
			state,
			translatations: [
				{ path: ["a", 0, 1, 0], value: "B" },
				{ path: ["a", 0, 1, 1], value: "C" },
			],
		});

		const expected = { a: [["A0", ["B", "C"]]] };

		expect(received).toEqual(expected);
	});

	test("array: object -> object", () => {
		const s = new StateManager();
		const state = { a: [["A0", { b: "B" }]] };

		const received = s.updateI18nResources({
			state,
			translatations: [
				{ path: ["a", 0, 1, "b"], value: "B_M" },
				{ path: ["a", 0, 1, "c"], value: "C" },
			],
		});

		const expected = { a: [["A0", { b: "B_M", c: "C" }]] };

		expect(received).toEqual(expected);
	});
});
