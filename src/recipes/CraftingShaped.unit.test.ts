import * as assert from "assert";
import { isRight } from "fp-ts/lib/Either";
import { CraftingShaped } from "./CraftingShaped";
import { items, item, tag } from "../parts";
import { itemIng, tagIng } from "./common";

describe("Shaped crafting", () => {
	test("invalid inputs", () => {
		// Empty pattern
		expect(
			CraftingShaped.decode({
				type: "crafting_shaped",
				pattern: [],
				key: {},
				result: "1 apple",
			}),
		).toBeLeft();

		// Pattern rows are uneven
		expect(
			CraftingShaped.decode({
				type: "crafting_shaped",
				pattern: ["c", "cc"],
				key: { c: "cobblestone" },
				result: "2 cobblestone_stairs",
			}),
		).toBeLeft();

		// Pattern too short
		expect(
			CraftingShaped.decode({
				type: "crafting_shaped",
				pattern: [""],
				key: {},
				result: "1 apple",
			}),
		).toBeLeft();

		// Pattern too wide
		expect(
			CraftingShaped.decode({
				type: "crafting_shaped",
				pattern: ["aaaaa"],
				key: { a: "apple" },
				result: "1 apple",
			}),
		).toBeLeft();

		// Pattern too tall
		expect(
			CraftingShaped.decode({
				type: "crafting_shaped",
				pattern: ["a", "a", "a", "a"],
				key: { a: "apple" },
				result: "1 apple",
			}),
		).toBeLeft();

		// Entry in pattern is missing in key
		expect(
			CraftingShaped.decode({
				type: "crafting_shaped",
				pattern: ["ab", "ab"],
				key: { a: "apple" },
				result: "1 apple",
			}),
		).toBeLeft();

		// Entry in key is missing in pattern
		expect(
			CraftingShaped.decode({
				type: "crafting_shaped",
				pattern: ["a"],
				key: { a: "apple", c: "cobblestone" },
				result: "1 apple",
			}),
		).toBeLeft();

		// Key isn't a single character
		expect(
			CraftingShaped.decode({
				type: "crafting_shaped",
				pattern: ["ac"],
				key: { a: "apple", ac: "cobblestone" },
				result: "1 apple",
			}),
		).toBeLeft();

		// Key is a space
		expect(
			CraftingShaped.decode({
				type: "crafting_shaped",
				pattern: ["a "],
				key: { a: "apple", " ": "cobblestone" },
				result: "1 apple",
			}),
		).toBeLeft();
	});

	test("crafting table", () => {
		const recipe = CraftingShaped.decode({
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
		expect(CraftingShaped.encode(recipe.right)).toEqual({
			type: "minecraft:crafting_shaped",
			pattern: ["pp", "pp"],
			key: { p: [tagIng("planks")] },
			result: {
				count: 1,
				item: "minecraft:crafting_table",
			},
		});
	});

	test("enchanting table", () => {
		const recipe = CraftingShaped.decode({
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
		expect(CraftingShaped.encode(recipe.right)).toEqual({
			type: "minecraft:crafting_shaped",
			pattern: [" b ", "dod", "ooo"],
			key: { b: [itemIng("book")], d: [itemIng("diamond")], o: [itemIng("obsidian")] },
			result: {
				count: 1,
				item: "minecraft:enchanting_table",
			},
		});
	});
});
