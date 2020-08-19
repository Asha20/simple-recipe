import * as assert from "assert";
import { isRight } from "fp-ts/lib/Either";
import { Stonecutting } from "./Stonecutting";
import { item, itemStack, tag } from "../parts";

describe("Stonecutting", () => {
	test("decode and encode 1", () => {
		const recipe = Stonecutting.decode({
			type: "stonecutting",
			ingredients: "apple",
			result: "1 apple",
		});

		expect(recipe).toBeRight({
			type: "stonecutting",
			ingredients: item("minecraft:apple"),
			result: itemStack("minecraft:apple", 1),
		});

		assert(isRight(recipe));
		expect(Stonecutting.encode(recipe.right)).toEqual({
			type: "stonecutting",
			ingredient: [{ item: "minecraft:apple" }],
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
			ingredients: tag("minecraft:breakable"),
			result: itemStack("minecraft:dirt", 4),
		});

		assert(isRight(recipe));
		expect(Stonecutting.encode(recipe.right)).toEqual({
			type: "stonecutting",
			ingredient: [{ tag: "minecraft:breakable" }],
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
			ingredients: [item("minecraft:apple"), tag("minecraft:edible"), item("foo:bar")],
			result: itemStack("minecraft:apple", 3),
		});

		assert(isRight(recipe));
		expect(Stonecutting.encode(recipe.right)).toEqual({
			type: "stonecutting",
			ingredient: [{ item: "minecraft:apple" }, { tag: "minecraft:edible" }, { item: "foo:bar" }],
			result: "minecraft:apple",
			count: 3,
		});
	});
});
