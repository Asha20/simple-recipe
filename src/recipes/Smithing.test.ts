import * as assert from "assert";
import { isRight } from "fp-ts/lib/Either";
import { Smithing } from "./Smithing";
import { item } from "../parts";
import { itemIng } from "./common";

describe("Smithing", () => {
	test("netherite sword", () => {
		const recipe = Smithing.decode({
			type: "smithing",
			base: "diamond_sword",
			addition: "netherite_ingot",
			result: "netherite_sword",
		});

		expect(recipe).toBeRight({
			type: "smithing",
			base: item("diamond_sword"),
			addition: item("netherite_ingot"),
			result: item("netherite_sword"),
		});

		assert(isRight(recipe));
		expect(Smithing.encode(recipe.right)).toEqual({
			type: "minecraft:smithing",
			base: itemIng("diamond_sword"),
			addition: itemIng("netherite_ingot"),
			result: "minecraft:netherite_sword",
		});
	});
});
