import { describe, expect, test } from "bun:test";
import { State } from "../state";
import type { Delta } from "../state.types";

describe("State.diffObjects", () => {
	test("returns empty list when documents are identical", () => {
		const doc = { a: "1", b: { c: "2" }, d: ["1", "2", "3"] };
		const received = State.diffObjects({
			oldObj: doc,
			newObj: JSON.parse(JSON.stringify(doc)),
		});

		expect(received).toHaveLength(0);
	});

	// Object

	test("object: add primitive", () => {
		const oldState = { a: "A" };
		const newState = { a: "A", b: "B" };

		const received = State.diffObjects({
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
		const oldState = { a: "A" };
		const newState = { a: "A", b: ["B0", "B1"] };

		const received = State.diffObjects({
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
		const oldState = { a: "A" };
		const newState = { a: "A", b: { b1: "B1", b2: "B2" } };

		const received = State.diffObjects({
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
		const oldState = { a: "A", b: "B" };
		const newState = { a: "A" };

		const received = State.diffObjects({
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
		const oldState = { a: "A", b: ["B0", "B1"] };
		const newState = { a: "A" };

		const received = State.diffObjects({
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

	test("object: remove object", () => {
		const oldState = { a: "A", b: { b1: "B1", b2: "B2" } };
		const newState = { a: "A" };

		const received = State.diffObjects({
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

	test("object: primitive -> primitive", () => {
		const oldState = { a: "A", b: "B" };
		const newState = { a: "A", b: "B_M" };

		const received = State.diffObjects({
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
		const oldState = { a: "A", b: "B" };
		const newState = { a: "A", b: ["B0", "B1"] };

		const received = State.diffObjects({
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
		const oldState = { a: "A", b: "B" };
		const newState = { a: "A", b: { b1: "B1", b2: "B2" } };

		const received = State.diffObjects({
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
		const oldState = { a: "A", b: ["B0", "B1"] };
		const newState = { a: "A", b: "B" };

		const received = State.diffObjects({
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
		const oldState = { a: "A", b: ["B0", "B1"] };
		const newState = { a: "A", b: ["B0", "B1", "B2"] };

		const received = State.diffObjects({
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
		const oldState = { a: "A", b: { b1: "B1", b2: "B2" } };
		const newState = { a: "A", b: "B" };

		const received = State.diffObjects({
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
		const oldState = { a: "A", b: { b1: "B1", b2: "B2" } };
		const newState = { a: "A", b: ["B0", "B1"] };

		const received = State.diffObjects({
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
		const oldState = { a: "A", b: { b1: "B1", b2: "B2" } };
		const newState = { a: "A", b: { b1: "B1", b2: "B2", b3: "B3" } };

		const received = State.diffObjects({
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
		const oldState = { a: "A", b: ["B0"] };
		const newState = { a: "A", b: ["B0", "B1"] };

		const received = State.diffObjects({
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
		const oldState = { a: "A", b: ["B0"] };
		const newState = { a: "A", b: ["B0", ["C"]] };

		const received = State.diffObjects({
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
		const oldState = { a: "A", b: ["B0"] };
		const newState = { a: "A", b: ["B0", { c: "C" }] };

		const received = State.diffObjects({
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
		const oldState = { a: "A", b: ["B0", "B1"] };
		const newState = { a: "A", b: ["B0"] };

		const received = State.diffObjects({
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
		const oldState = { a: "A", b: ["B0", ["C1", "C2"]] };
		const newState = { a: "A", b: ["B0"] };

		const received = State.diffObjects({
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

	test("array: remove object", () => {
		const oldState = { a: "A", b: ["B0", { c: "C" }] };
		const newState = { a: "A", b: ["B0"] };

		const received = State.diffObjects({
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

	test("array: primitive -> primitive", () => {
		const oldState = { a: "A", b: ["B0"] };
		const newState = { a: "A", b: ["B0_M"] };

		const received = State.diffObjects({
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
		const oldState = { a: "A", b: ["B0", "B1"] };
		const newState = { a: "A", b: ["B0", ["C0", "C1"]] };

		const received = State.diffObjects({
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
		const oldState = { a: "A", b: ["B0", "B1"] };
		const newState = { a: "A", b: ["B0", { c: "C" }] };

		const received = State.diffObjects({
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
		const oldState = { a: "A", b: ["B0", "B1"] };
		const newState = { a: "A", b: "B" };

		const received = State.diffObjects({
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
		const oldState = { a: "A", b: ["C", "D"] };
		const newState = { a: "A", b: ["D", "C"] };

		const received = State.diffObjects({
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
		const oldState = { a: "A", b: ["B0", { c: "C" }] };
		const newState = { a: "A", b: ["B0", "B1"] };

		const received = State.diffObjects({
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
		const oldState = { a: "A", b: ["B0", { c: "C" }] };
		const newState = { a: "A", b: ["B0", ["C0", "C1"]] };

		const received = State.diffObjects({
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
		const oldState = { a: "A", b: ["B0", { c: "C" }] };
		const newState = { a: "A", b: ["B0", { c: "C", d: "D" }] };

		const received = State.diffObjects({
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
