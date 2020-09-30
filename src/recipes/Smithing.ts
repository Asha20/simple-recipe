import { chain, left, right } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { of } from "fp-ts/lib/NonEmptyArray";
import { Item, item, ItemOrTag, parseItem, parseItemOrTag, stringifyName } from "../parts";
import { encodeGroup, err, hasKeys, isObject, PEither, seqS, tryParseGroup } from "../util";
import { Ingredient, ItemIngredient } from "./ingredient";
import * as ingredient from "./ingredient";

export interface MCSmithing {
	type: "minecraft:smithing";
	group?: string;
	base: Ingredient;
	addition: Ingredient;
	result: ItemIngredient;
}

export interface OwnSmithing {
	type: "smithing";
	group?: string;
	base: ItemOrTag;
	addition: ItemOrTag;
	result: Item;
}

export function parseSmithing(u: unknown): PEither<OwnSmithing> {
	return pipe(
		isObject(u),
		chain(o => hasKeys(o, "type", "base", "addition", "result")),
		chain(o =>
			seqS({
				type: o.type === "smithing" ? right(o.type) : left(of(err("Wrong type"))),
				...tryParseGroup(o),
				base: parseItemOrTag(o.base),
				addition: parseItemOrTag(o.addition),
				result: parseItem(o.result),
			}),
		),
	);
}

export function encodeSmithing(x: OwnSmithing): MCSmithing {
	const type = ("minecraft:" + x.type) as MCSmithing["type"];
	return {
		type,
		...encodeGroup(x.group),
		base: ingredient.from(x.base),
		addition: ingredient.from(x.addition),
		result: { item: stringifyName(x.result, true) },
	};
}

export function decodeSmithing(x: MCSmithing): OwnSmithing {
	return {
		type: "smithing",
		base: ingredient.toItemOrTag(x.base),
		addition: ingredient.toItemOrTag(x.addition),
		result: item(x.result.item),
	};
}
