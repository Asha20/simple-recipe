import * as assert from "assert";
import { isRight } from "fp-ts/lib/Either";
import { Cooking } from "./Cooking";
import { item } from "../parts";
import { itemIng } from "./common";

describe("Cooking", () => {
	describe("invalid inputs", () => {
		test("Missing cookingtime and experience", () => {
			expect(
				Cooking.decode({
					type: "blasting",
					ingredients: "cobblestone",
					result: "stone",
				}),
			).toBeLeft();
		});

		test("cookingtime not an int", () => {
			expect(
				Cooking.decode({
					type: "blasting",
					ingredients: "cobblestone",
					cookingtime: 12.5,
					experience: 100,
					result: "stone",
				}),
			).toBeLeft();
		});

		test("cookingtime isn't positive", () => {
			expect(
				Cooking.decode({
					type: "blasting",
					ingredients: "cobblestone",
					cookingtime: 0,
					experience: 100,
					result: "stone",
				}),
			).toBeLeft();
		});

		test("experience isn't positive", () => {
			expect(
				Cooking.decode({
					type: "blasting",
					ingredients: "cobblestone",
					cookingtime: 100,
					experience: -5,
					result: "stone",
				}),
			).toBeLeft();
		});
	});

	describe("Valid recipes", () => {
		test("blasting", () => {
			const recipe = Cooking.decode({
				type: "blasting",
				ingredients: "cobblestone",
				cookingtime: 100,
				experience: 10,
				result: "stone",
			});

			expect(recipe).toBeRight({
				type: "blasting",
				ingredients: item("cobblestone"),
				cookingtime: 100,
				experience: 10,
				result: item("stone"),
			});

			assert(isRight(recipe));
			expect(Cooking.encode(recipe.right)).toEqual({
				type: "minecraft:blasting",
				ingredient: itemIng("cobblestone"),
				cookingtime: 100,
				experience: 10,
				result: "minecraft:stone",
			});
		});

		test("campfire cooking", () => {
			const recipe = Cooking.decode({
				type: "campfire_cooking",
				ingredients: "cod",
				cookingtime: 100,
				experience: 0.5,
				result: "cooked_cod",
			});

			expect(recipe).toBeRight({
				type: "campfire_cooking",
				ingredients: item("cod"),
				cookingtime: 100,
				experience: 0.5,
				result: item("cooked_cod"),
			});

			assert(isRight(recipe));
			expect(Cooking.encode(recipe.right)).toEqual({
				type: "minecraft:campfire_cooking",
				ingredient: itemIng("cod"),
				cookingtime: 100,
				experience: 0.5,
				result: "minecraft:cooked_cod",
			});
		});
	});
});
