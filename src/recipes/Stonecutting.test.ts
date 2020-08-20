import * as assert from "assert";
import { isRight } from "fp-ts/lib/Either";
import { Stonecutting } from "./Stonecutting";
import { item, items, tag } from "../parts";
import { itemIng, tagIng } from "./common";

describe("Stonecutting", () => {
	test("decode and encode 1", () => {
		const recipe = Stonecutting.decode({
			type: "stonecutting",
			ingredients: "apple",
			result: "1 apple",
		});

		expect(recipe).toBeRight({
			type: "stonecutting",
			ingredients: item("apple"),
			result: items("apple", 1),
		});

		assert(isRight(recipe));
		expect(Stonecutting.encode(recipe.right)).toEqual({
			type: "stonecutting",
			ingredient: [itemIng("apple")],
			result: "minecraft:apple",
			count: 1,
		});
	});

	test("decode and encode 2", () => {
		const recipe = Stonecutting.decode({
			type: "stonecutting",
			ingredients: "+breakable",
			result: "4 dirt",
		});

		expect(recipe).toBeRight({
			type: "stonecutting",
			ingredients: tag("breakable"),
			result: items("dirt", 4),
		});

		assert(isRight(recipe));
		expect(Stonecutting.encode(recipe.right)).toEqual({
			type: "stonecutting",
			ingredient: [tagIng("breakable")],
			result: "minecraft:dirt",
			count: 4,
		});
	});

	test("decode and encode 3", () => {
		const recipe = Stonecutting.decode({
			type: "stonecutting",
			ingredients: ["apple", "+edible", "foo:bar"],
			result: "3 apple",
		});

		expect(recipe).toBeRight({
			type: "stonecutting",
			ingredients: [item("apple"), tag("edible"), item("bar", "foo")],
			result: items("apple", 3),
		});

		assert(isRight(recipe));
		expect(Stonecutting.encode(recipe.right)).toEqual({
			type: "stonecutting",
			ingredient: [itemIng("apple"), tagIng("edible"), itemIng("bar", "foo")],
			result: "minecraft:apple",
			count: 3,
		});
	});
});
