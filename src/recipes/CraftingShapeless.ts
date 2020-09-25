import { chain, left, right } from "fp-ts/lib/Either";
import { of } from "fp-ts/lib/NonEmptyArray";
import { pipe } from "fp-ts/lib/pipeable";
import { Items, parseItems, parseStack, Stack, items, Tags, ItemsOrTags } from "../parts";
import { hasKeys, isObject, PEither, seqS, err, tryParseGroup, encodeGroup, encodeCount } from "../util";
import { Ingredient, stringify, toIngredients, fromIngredientsToStack } from "./common";

export interface MCCraftingShapeless {
	type: "minecraft:crafting_shapeless";
	group?: string;
	ingredients: Array<Ingredient | Ingredient[]>;
	result: {
		count?: number;
		item: string;
	};
}

export interface OwnCraftingShapeless {
	type: "crafting_shapeless";
	group?: string;
	ingredients: ItemsOrTags | Array<ItemsOrTags | Array<ItemsOrTags>>;
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
				ingredients: parseStack(o.ingredients) as PEither<OwnCraftingShapeless["ingredients"]>,
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
		ingredients: toIngredients(x.ingredients) as MCCraftingShapeless["ingredients"],
		result: {
			...encodeCount(x.result.count),
			item: stringify(x.result),
		},
	};
}

export function decodeCraftingShapeless(x: MCCraftingShapeless): OwnCraftingShapeless {
	return {
		type: "crafting_shapeless",
		ingredients: fromIngredientsToStack(x.ingredients) as OwnCraftingShapeless["ingredients"],
		result: items(x.result.item, x.result.count ?? 1),
	};
}
