import * as assert from "assert";
import { isRight } from "fp-ts/lib/Either";
import { parseCraftingShapeless, encodeCraftingShapeless } from "./CraftingShapeless";
import { items, tags } from "../parts";
import * as ingredient from "./ingredient";

describe("Shapeless crafting", () => {
	test("single item stack", () => {
		const recipe = parseCraftingShapeless({
			type: "crafting_shapeless",
			ingredients: "2 oak_log",
			result: "4 oak_planks",
		});

		expect(recipe).toBeRight({
			type: "crafting_shapeless",
			ingredients: items("oak_log", 2),
			result: items("oak_planks", 4),
		});

		assert(isRight(recipe));
		expect(encodeCraftingShapeless(recipe.right)).toEqual({
			type: "minecraft:crafting_shapeless",
			ingredients: ingredient.items(2, "oak_log"),
			result: {
				count: 4,
				item: "minecraft:oak_planks",
			},
		});
	});

	test("single tag stack", () => {
		const recipe = parseCraftingShapeless({
			type: "crafting_shapeless",
			ingredients: "2 +log",
			result: "16 stick",
		});

		expect(recipe).toBeRight({
			type: "crafting_shapeless",
			ingredients: tags("log", 2),
			result: items("stick", 16),
		});

		assert(isRight(recipe));
		expect(encodeCraftingShapeless(recipe.right)).toEqual({
			type: "minecraft:crafting_shapeless",
			ingredients: ingredient.tags(2, "log"),
			result: {
				count: 16,
				item: "minecraft:stick",
			},
		});
	});

	test("nested array of stacks", () => {
		const recipe = parseCraftingShapeless({
			type: "crafting_shapeless",
			ingredients: ["8 sand", ["1 fire_charge", "1 flint_and_steel"]],
			result: "8 glass",
		});

		expect(recipe).toBeRight({
			type: "crafting_shapeless",
			ingredients: [items("sand", 8), [items("fire_charge", 1), items("flint_and_steel", 1)]],
			result: items("glass", 8),
		});

		assert(isRight(recipe));
		expect(encodeCraftingShapeless(recipe.right)).toEqual({
			type: "minecraft:crafting_shapeless",
			ingredients: [
				...ingredient.items(8, "sand"),
				[ingredient.item("fire_charge"), ingredient.item("flint_and_steel")],
			],
			result: {
				count: 8,
				item: "minecraft:glass",
			},
		});
	});
});
