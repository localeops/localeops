import { describe, expect, test } from "bun:test";
import { StateManager } from "../state-manager";

describe("StateManager.removeKeys", () => {
	test("object: remove primitive", () => {
		const s = new StateManager();
		const state = { a: "A", b: { b1: "B1", b2: "B2" } };

		const received = s.removeKeys({
			state,
			deltas: [
				{ key: "b1", path: ["b", "b1"], leafPath: ["b"], type: "removed" },
			],
		});

		const expected = { a: "A", b: { b2: "B2" } };

		expect(received).toEqual(expected);
	});

	test("object: remove all fields", () => {
		const s = new StateManager();
		const state = { a: "A", b: { b1: "B1", b2: "B2" } };

		const received = s.removeKeys({
			state,
			deltas: [
				{ key: "b1", path: ["b", "b1"], leafPath: ["b"], type: "removed" },
				{ key: "b2", path: ["b", "b2"], leafPath: ["b"], type: "removed" },
			],
		});

		const expected = { a: "A", b: {} };

		expect(received).toEqual(expected);
	});

	test("object: remove array", () => {
		const s = new StateManager();
		const state = { a: "A", b: ["B1", "B2"] };

		const received = s.removeKeys({
			state,
			deltas: [{ key: "b", path: ["b"], leafPath: [], type: "removed" }],
		});

		const expected = { a: "A" };

		expect(received).toEqual(expected);
	});

	test("object: remove object", () => {
		const s = new StateManager();
		const state = { a: "A", b: { b1: "B1", b2: "B2" } };

		const received = s.removeKeys({
			state,
			deltas: [{ key: "b", path: ["b"], leafPath: [], type: "removed" }],
		});

		const expected = { a: "A" };

		expect(received).toEqual(expected);
	});

	test("array: remove primitive", () => {
		const s = new StateManager();
		const state = { a: "A", b: ["B0", "B1"] };

		const received = s.removeKeys({
			state,
			deltas: [{ key: 0, path: ["b", 0], leafPath: ["b"], type: "removed" }],
		});

		const expected = { a: "A", b: ["B1"] };

		expect(received).toEqual(expected);
	});

	test("array: remove all elements", () => {
		const s = new StateManager();
		const state = { a: "A", b: ["B0", "B1"] };

		const received = s.removeKeys({
			state,
			deltas: [
				{ key: 0, path: ["b", 0], leafPath: ["b"], type: "removed" },
				{ key: 1, path: ["b", 1], leafPath: ["b"], type: "removed" },
			],
		});

		const expected = { a: "A", b: [] };

		expect(received).toEqual(expected);
	});

	test("array: remove array", () => {
		const s = new StateManager();
		const state = { a: "A", b: ["B0", ["B10", "B11"]] };

		const received = s.removeKeys({
			state,
			deltas: [{ key: 1, path: ["b", 1], leafPath: ["b"], type: "removed" }],
		});

		const expected = { a: "A", b: ["B0"] };

		expect(received).toEqual(expected);
	});

	test("array: remove object", () => {
		const s = new StateManager();
		const state = { a: "A", b: ["B0", { c: "C", d: "D" }] };

		const received = s.removeKeys({
			state,
			deltas: [{ key: 1, path: ["b", 1], leafPath: ["b"], type: "removed" }],
		});

		const expected = { a: "A", b: ["B0"] };

		expect(received).toEqual(expected);
	});
});
