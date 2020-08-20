import * as t from "io-ts";
import { Items, Stack } from "../parts";
import { Ingredient, toIngredients, stringify } from "./common";
import { Either, chain } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";

export type OwnCraftingShapeless = t.TypeOf<typeof OwnCraftingShapeless>;
export interface MCCraftingShapeless {
	type: "crafting_shapeless";
	ingredients: Ingredient[];
	result: {
		count: number;
		item: string;
	};
}

const OwnCraftingShapeless = t.type({
	type: t.literal("crafting_shapeless"),
	ingredients: Stack,
	result: Items,
});

function encode(x: OwnCraftingShapeless): MCCraftingShapeless {
	return {
		type: x.type,
		ingredients: toIngredients(x.ingredients),
		result: {
			count: x.result.count,
			item: stringify(x.result),
		},
	};
}

function validate(u: unknown, c: t.Context): Either<t.Errors, OwnCraftingShapeless> {
	return pipe(
		OwnCraftingShapeless.validate(u, c),
		chain(x => {
			const ingredients = toIngredients(x.ingredients);
			return ingredients.length > 0 && ingredients.length <= 9 ? t.success(x) : t.failure(u, c, "Too many ingredients");
		}),
	);
}

export const CraftingShapeless = new t.Type<OwnCraftingShapeless, MCCraftingShapeless, unknown>(
	"CraftingShapeless",
	OwnCraftingShapeless.is,
	validate,
	encode,
);
