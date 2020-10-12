import { chain } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { Items, items, ItemsOrTags, parseItems, parseStack, stringifyName } from "../parts";
import { encodeCount, encodeGroup, hasKeys, isObject, parseType, PEither, seqS, tryParseGroup } from "../util";
import * as ingredient from "./ingredient";
import { Ingredient } from "./ingredient";

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
				type: parseType(o.type, "crafting_shapeless"),
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
		ingredients: ingredient.from(x.ingredients) as MCCraftingShapeless["ingredients"],
		result: {
			...encodeCount(x.result.count),
			item: stringifyName(x.result, true),
		},
	};
}

export function decodeCraftingShapeless(x: MCCraftingShapeless): OwnCraftingShapeless {
	return {
		type: "crafting_shapeless",
		ingredients: ingredient.toStack(x.ingredients) as OwnCraftingShapeless["ingredients"],
		result: items(x.result.item, x.result.count ?? 1),
	};
}
