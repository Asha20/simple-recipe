import * as assert from "assert";
import { isRight } from "fp-ts/lib/Either";
import { parseSmithing, encodeSmithing } from "./Smithing";
import { item } from "../parts";
import * as ingredient from "./ingredient";

describe("Smithing", () => {
	test("iron sword", () => {
		const recipe = parseSmithing({
			type: "smithing",
			base: "stone_sword",
			addition: "iron_ingot",
			result: "iron_sword",
		});

		expect(recipe).toBeRight({
			type: "smithing",
			base: item("stone_sword"),
			addition: item("iron_ingot"),
			result: item("iron_sword"),
		});

		assert(isRight(recipe));
		expect(encodeSmithing(recipe.right)).toEqual({
			type: "minecraft:smithing",
			base: ingredient.item("stone_sword"),
			addition: ingredient.item("iron_ingot"),
			result: ingredient.item("iron_sword"),
		});
	});
});
