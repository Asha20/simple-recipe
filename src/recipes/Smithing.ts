import { chain, left, right } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { of } from "fp-ts/lib/NonEmptyArray";
import { Item, ItemOrTag, parseItem, parseItemOrTag } from "../parts";
import { hasKeys, isObject, PEither, seqS, err } from "../util";
import { Ingredient, ItemIngredient, stringify, toIngredient } from "./common";

export interface MCSmithing {
	type: "minecraft:smithing";
	base: Ingredient;
	addition: Ingredient;
	result: ItemIngredient;
}

export interface OwnSmithing {
	type: "smithing";
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
		base: toIngredient(x.base),
		addition: toIngredient(x.addition),
		result: { item: stringify(x.result) },
	};
}
