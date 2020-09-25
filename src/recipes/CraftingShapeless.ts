import { chain, left, right } from "fp-ts/lib/Either";
import { of } from "fp-ts/lib/NonEmptyArray";
import { pipe } from "fp-ts/lib/pipeable";
import { Items, parseItems, parseStack, Stack } from "../parts";
import { hasKeys, isObject, PEither, seqS, err, tryParseGroup, encodeGroup } from "../util";
import { Ingredient, stringify, toIngredients } from "./common";

export interface MCCraftingShapeless {
	type: "minecraft:crafting_shapeless";
	group?: string;
	ingredients: Ingredient[];
	result: {
		count: number;
		item: string;
	};
}

export interface OwnCraftingShapeless {
	type: "crafting_shapeless";
	group?: string;
	ingredients: Stack;
	result: Items;
}

export function parseCraftingShapeless(u: unknown): PEither<OwnCraftingShapeless> {
	return pipe(
		isObject(u),
		chain(o => hasKeys(o, "type", "ingredients", "result")),
		chain(o =>
			seqS({
				type: o.type === "crafting_shapeless" ? right(o.type) : left(of(err("Wrong type"))),
				...tryParseGroup(o),
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
		...encodeGroup(x.group),
		ingredients: toIngredients(x.ingredients),
		result: {
			count: x.result.count,
			item: stringify(x.result),
		},
	};
}
