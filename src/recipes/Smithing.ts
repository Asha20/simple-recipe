import { chain, left, right } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { of } from "fp-ts/lib/NonEmptyArray";
import { Item, ItemOrTag, parseItem, parseItemOrTag, item } from "../parts";
import { hasKeys, isObject, PEither, seqS, err, tryParseGroup, encodeGroup } from "../util";
import { Ingredient, ItemIngredient, stringify, toIngredient, fromIngredient } from "./common";
import * as assert from "assert";

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
		base: toIngredient(x.base),
		addition: toIngredient(x.addition),
		result: { item: stringify(x.result) },
	};
}

export function decodeSmithing(x: MCSmithing): OwnSmithing {
	assert(!Array.isArray(x.base));
	assert(!Array.isArray(x.addition));
	return {
		type: "smithing",
		base: fromIngredient(x.base),
		addition: fromIngredient(x.addition),
		result: item(x.result.item),
	};
}
