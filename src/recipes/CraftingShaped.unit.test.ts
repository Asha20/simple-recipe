import * as assert from "assert";
import { isRight } from "fp-ts/lib/Either";
import { parseCraftingShaped, encodeCraftingShaped } from "./CraftingShaped";
import { items, item, tag } from "../parts";
import { itemIng, tagIng } from "./common";

describe("Shaped crafting", () => {
	describe("Invalid inputs", () => {
		test("Empty pattern", () => {
			expect(
				parseCraftingShaped({
					type: "crafting_shaped",
					pattern: [],
					key: {},
					result: "1 apple",
				}),
			).toBeLeft();
		});

		test("Pattern rows are uneven", () => {
			expect(
				parseCraftingShaped({
					type: "crafting_shaped",
					pattern: ["c", "cc"],
					key: { c: "cobblestone" },
					result: "2 cobblestone_stairs",
				}),
			).toBeLeft();
		});

		test("Pattern too short", () => {
			expect(
				parseCraftingShaped({
					type: "crafting_shaped",
					pattern: [""],
					key: {},
					result: "1 apple",
				}),
			).toBeLeft();
		});

		test("Pattern too wide", () => {
			expect(
				parseCraftingShaped({
					type: "crafting_shaped",
					pattern: ["aaaaa"],
					key: { a: "apple" },
					result: "1 apple",
				}),
			).toBeLeft();
		});

		test("Pattern too tall", () => {
			expect(
				parseCraftingShaped({
					type: "crafting_shaped",
					pattern: ["a", "a", "a", "a"],
					key: { a: "apple" },
					result: "1 apple",
				}),
			).toBeLeft();
		});

		test("Entry in pattern is missing in key", () => {
			expect(
				parseCraftingShaped({
					type: "crafting_shaped",
					pattern: ["ab", "ab"],
					key: { a: "apple" },
					result: "1 apple",
				}),
			).toBeLeft();
		});

		test("Entry in key is missing in pattern", () => {
			expect(
				parseCraftingShaped({
					type: "crafting_shaped",
					pattern: ["a"],
					key: { a: "apple", c: "cobblestone" },
					result: "1 apple",
				}),
			).toBeLeft();
		});

		test("Key isn't a single character", () => {
			expect(
				parseCraftingShaped({
					type: "crafting_shaped",
					pattern: ["ac"],
					key: { a: "apple", ac: "cobblestone" },
					result: "1 apple",
				}),
			).toBeLeft();
		});

		test("Key is a space", () => {
			expect(
				parseCraftingShaped({
					type: "crafting_shaped",
					pattern: ["a "],
					key: { a: "apple", " ": "cobblestone" },
					result: "1 apple",
				}),
			).toBeLeft();
		});
	});

	describe("Valid inputs", () => {
		test("crafting table", () => {
			const recipe = parseCraftingShaped({
				type: "crafting_shaped",
				pattern: ["pp", "pp"],
				key: { p: "+planks" },
				result: "1 crafting_table",
			});

			expect(recipe).toBeRight({
				type: "crafting_shaped",
				pattern: ["pp", "pp"],
				key: { p: tag("planks") },
				result: items("crafting_table", 1),
			});

			assert(isRight(recipe));
			expect(encodeCraftingShaped(recipe.right)).toEqual({
				type: "minecraft:crafting_shaped",
				pattern: ["pp", "pp"],
				key: { p: tagIng("planks") },
				result: {
					count: 1,
					item: "minecraft:crafting_table",
				},
			});
		});

		test("enchanting table", () => {
			const recipe = parseCraftingShaped({
				type: "crafting_shaped",
				pattern: [" b ", "dod", "ooo"],
				key: { b: "book", d: "diamond", o: "obsidian" },
				result: "1 enchanting_table",
			});

			expect(recipe).toBeRight({
				type: "crafting_shaped",
				pattern: [" b ", "dod", "ooo"],
				key: { b: item("book"), d: item("diamond"), o: item("obsidian") },
				result: items("enchanting_table", 1),
			});

			assert(isRight(recipe));
			expect(encodeCraftingShaped(recipe.right)).toEqual({
				type: "minecraft:crafting_shaped",
				pattern: [" b ", "dod", "ooo"],
				key: { b: itemIng("book"), d: itemIng("diamond"), o: itemIng("obsidian") },
				result: {
					count: 1,
					item: "minecraft:enchanting_table",
				},
			});
		});
	});
});
