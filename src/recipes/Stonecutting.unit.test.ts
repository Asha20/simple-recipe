import * as assert from "assert";
import { isRight } from "fp-ts/lib/Either";
import { parseStonecutting, encodeStonecutting } from "./Stonecutting";
import { item, items, tag } from "../parts";
import * as ingredient from "./ingredient";

describe("Stonecutting", () => {
	test("decode and encode 1", () => {
		const recipe = parseStonecutting({
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
		expect(encodeStonecutting(recipe.right)).toEqual({
			type: "minecraft:stonecutting",
			ingredient: ingredient.item("apple"),
			result: "minecraft:apple",
			count: 1,
		});
	});

	test("decode and encode 2", () => {
		const recipe = parseStonecutting({
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
		expect(encodeStonecutting(recipe.right)).toEqual({
			type: "minecraft:stonecutting",
			ingredient: ingredient.tag("breakable"),
			result: "minecraft:dirt",
			count: 4,
		});
	});

	test("decode and encode 3", () => {
		const recipe = parseStonecutting({
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
		expect(encodeStonecutting(recipe.right)).toEqual({
			type: "minecraft:stonecutting",
			ingredient: [ingredient.item("apple"), ingredient.tag("edible"), ingredient.item("bar", "foo")],
			result: "minecraft:apple",
			count: 3,
		});
	});
});
