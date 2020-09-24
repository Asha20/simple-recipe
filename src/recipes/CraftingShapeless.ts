import { Items, Stack, parseStack, parseItems } from "../parts";
import { Ingredient, toIngredients, stringify } from "./common";
import { Either, chain, right, left } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { NonEmptyArray, of } from "fp-ts/lib/NonEmptyArray";
import { seqS, isObject, hasKeys } from "../util";

export interface MCCraftingShapeless {
	type: "minecraft:crafting_shapeless";
	ingredients: Ingredient[];
	result: {
		count: number;
		item: string;
	};
}

export interface OwnCraftingShapeless {
	type: "crafting_shapeless";
	ingredients: Stack;
	result: Items;
}

export function parseCraftingShapeless(u: unknown): Either<NonEmptyArray<string>, OwnCraftingShapeless> {
	return pipe(
		isObject(u),
		chain(o => hasKeys(o, "type", "ingredients", "result")),
		chain(o =>
			seqS({
				type: o.type === "crafting_shapeless" ? right(o.type) : left(of("Wrong type")),
				ingredients: parseStack(o.ingredients),
				result: parseItems(o.result),
			}),
		),
	);
}

export function encodeCraftingShapeless(x: OwnCraftingShapeless): MCCraftingShapeless {
	const type = ("minecraft:" + x.type) as MCCraftingShapeless["type"];
	return {
		type,
		ingredients: toIngredients(x.ingredients),
		result: {
			count: x.result.count,
			item: stringify(x.result),
		},
	};
}
