import { chain, isRight, left, right } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { of } from "fp-ts/lib/NonEmptyArray";
import { ItemOrTag, Items, items, parseItemOrTag, parseItems } from "../parts";
import { parseArray } from "../parts/common";
import { encodeGroup, err, hasKeys, isObject, PEither, seqS, tryParseGroup } from "../util";
import { fromIngredientsToItemOrTags, stringify, toIngredients, Ingredient } from "./common";

export interface MCStonecutting {
	type: "minecraft:stonecutting";
	group?: string;
	ingredient: Ingredient | Ingredient[];
	result: string;
	count: number;
}

export interface OwnStonecutting {
	type: "stonecutting";
	group?: string;
	ingredients: ItemOrTag | ItemOrTag[];
	result: Items;
}

function parseIngredients(u: unknown): PEither<ItemOrTag | ItemOrTag[]> {
	const itemOrTag = parseItemOrTag(u);
	if (isRight(itemOrTag)) {
		return itemOrTag;
	}

	if (!Array.isArray(u)) {
		return left([err("Expected an Item, a Tag, or an array of Item or Tag."), ...itemOrTag.left]);
	}

	return parseArray(u, parseItemOrTag);
}

export function parseStonecutting(u: unknown): PEither<OwnStonecutting> {
	return pipe(
		isObject(u),
		chain(o => hasKeys(o, "type", "ingredients", "result")),
		chain(o =>
			seqS({
				type: o.type === "stonecutting" ? right(o.type) : left(of(err("Wrong type"))),
				...tryParseGroup(o),
				ingredients: parseIngredients(o.ingredients),
				result: parseItems(o.result),
			}),
		),
	);
}

export function encodeStonecutting(x: OwnStonecutting): MCStonecutting {
	const type = ("minecraft:" + x.type) as MCStonecutting["type"];
	return {
		type,
		...encodeGroup(x.group),
		ingredient: toIngredients(x.ingredients),
		result: stringify(x.result),
		count: x.result.count,
	};
}

export function decodeStonecutting(x: MCStonecutting): OwnStonecutting {
	return {
		type: "stonecutting",
		ingredients: fromIngredientsToItemOrTags(x.ingredient),
		result: items(x.result, x.count),
	};
}
