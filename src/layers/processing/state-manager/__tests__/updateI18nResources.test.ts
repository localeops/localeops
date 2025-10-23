import { describe, expect, test } from "bun:test";
import { StateManager } from "../state-manager";

describe("StateManager.updateI18nResources", () => {
	// Object

	test("object: new primitive", () => {
		const s = new StateManager();
		const state = { a: "A" };

		const received = s.updateI18nResources({
			state,
			translations: [{ path: ["b"], value: "B" }],
		});

		const expected = { a: "A", b: "B" };

		expect(received).toEqual(expected);
	});

	test("object: new array", () => {
		const s = new StateManager();
		const state = { a: "A" };

		const received = s.updateI18nResources({
			state,
			translations: [
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
			translations: [
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
			translations: [{ path: ["a"], value: "A_M" }],
		});

		const expected = { a: "A_M" };

		expect(received).toEqual(expected);
	});

	test("object: primitive -> array", () => {
		const s = new StateManager();
		const state = { a: "A" };

		const received = s.updateI18nResources({
			state,
			translations: [
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
			translations: [
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
			translations: [{ path: ["a"], value: "A" }],
		});

		const expected = { a: "A" };

		expect(received).toEqual(expected);
	});

	test("object: array -> array", () => {
		const s = new StateManager();
		const state = { a: ["A0", "A1"] };

		const received = s.updateI18nResources({
			state,
			translations: [{ path: ["a", 0], value: "A0_M" }],
		});

		const expected = { a: ["A0_M", "A1"] };

		expect(received).toEqual(expected);
	});

	test("object: object -> primitive", () => {
		const s = new StateManager();
		const state = { a: { a1: "A1", a2: "A2" } };

		const received = s.updateI18nResources({
			state,
			translations: [{ path: ["a"], value: "A" }],
		});

		const expected = { a: "A" };

		expect(received).toEqual(expected);
	});

	test("object: object -> array", () => {
		const s = new StateManager();
		const state = { a: { a1: "A1", a2: "A2" } };

		const received = s.updateI18nResources({
			state,
			translations: [
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
			translations: [
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
			translations: [{ path: ["a", 0, 2], value: "A2" }],
		});

		const expected = { a: [["A0", "A1", "A2"]] };

		expect(received).toEqual(expected);
	});

	test("array: new array", () => {
		const s = new StateManager();
		const state = { a: [["A0", "A1"]] };

		const received = s.updateI18nResources({
			state,
			translations: [
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
			translations: [
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
			translations: [
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
			translations: [
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
			translations: [
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
			translations: [{ path: ["a", 0, 1], value: "A1" }],
		});

		const expected = { a: [["A0", "A1"]] };

		expect(received).toEqual(expected);
	});

	test("array: object -> primitive", () => {
		const s = new StateManager();
		const state = { a: [["A0", { b: "B" }]] };

		const received = s.updateI18nResources({
			state,
			translations: [{ path: ["a", 0, 1], value: "A1" }],
		});

		const expected = { a: [["A0", "A1"]] };

		expect(received).toEqual(expected);
	});

	test("array: object -> array", () => {
		const s = new StateManager();
		const state = { a: [["A0", { b: "B" }]] };

		const received = s.updateI18nResources({
			state,
			translations: [
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
			translations: [
				{ path: ["a", 0, 1, "b"], value: "B_M" },
				{ path: ["a", 0, 1, "c"], value: "C" },
			],
		});

		const expected = { a: [["A0", { b: "B_M", c: "C" }]] };

		expect(received).toEqual(expected);
	});
});
