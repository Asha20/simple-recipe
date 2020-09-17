import * as assert from "assert";
import { isRight } from "fp-ts/lib/Either";
import { Smithing } from "./Smithing";
import { item } from "../parts";
import { itemIng } from "./common";

describe("Smithing", () => {
	test("iron sword", () => {
		const recipe = Smithing.decode({
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
		expect(Smithing.encode(recipe.right)).toEqual({
			type: "minecraft:smithing",
			base: itemIng("stone_sword"),
			addition: itemIng("iron_ingot"),
			result: "minecraft:iron_sword",
		});
	});
});
