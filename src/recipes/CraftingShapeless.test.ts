import * as assert from "assert";
import { isRight } from "fp-ts/lib/Either";
import { CraftingShapeless } from "./CraftingShapeless";
import { itemStack, tagStack } from "../parts";
import { arrayOf } from "./common";

describe("Shapeless crafting", () => {
	test("single item stack", () => {
		const recipe = CraftingShapeless.decode({
			type: "crafting_shapeless",
			ingredients: "1 oak_log",
			result: "4 oak_planks",
		});

		expect(recipe).toBeRight({
			type: "crafting_shapeless",
			ingredients: itemStack("minecraft:oak_log", 1),
			result: itemStack("minecraft:oak_planks", 4),
		});

		assert(isRight(recipe));
		expect(CraftingShapeless.encode(recipe.right)).toEqual({
			type: "crafting_shapeless",
			ingredients: [{ item: "minecraft:oak_log" }],
			result: {
				count: 4,
				item: "minecraft:oak_planks",
			},
		});
	});

	test("single tag stack", () => {
		const recipe = CraftingShapeless.decode({
			type: "crafting_shapeless",
			ingredients: "2 +log",
			result: "16 stick",
		});

		expect(recipe).toBeRight({
			type: "crafting_shapeless",
			ingredients: tagStack("minecraft:log", 2),
			result: itemStack("minecraft:stick", 16),
		});

		assert(isRight(recipe));
		expect(CraftingShapeless.encode(recipe.right)).toEqual({
			type: "crafting_shapeless",
			ingredients: [{ tag: "minecraft:log" }, { tag: "minecraft:log" }],
			result: {
				count: 16,
				item: "minecraft:stick",
			},
		});
	});

	test("nested array of stacks", () => {
		const recipe = CraftingShapeless.decode({
			type: "crafting_shapeless",
			ingredients: ["8 sand", ["1 fire_charge", "1 flint_and_steel"]],
			result: "8 glass",
		});

		expect(recipe).toBeRight({
			type: "crafting_shapeless",
			ingredients: [
				itemStack("minecraft:sand", 8),
				[itemStack("minecraft:fire_charge", 1), itemStack("minecraft:flint_and_steel", 1)],
			],
			result: itemStack("minecraft:glass", 8),
		});

		assert(isRight(recipe));
		expect(CraftingShapeless.encode(recipe.right)).toEqual({
			type: "crafting_shapeless",
			ingredients: [
				...arrayOf(8, { item: "minecraft:sand" }),
				[{ item: "minecraft:fire_charge" }, { item: "minecraft:flint_and_steel" }],
			],
			result: {
				count: 8,
				item: "minecraft:glass",
			},
		});
	});
});
