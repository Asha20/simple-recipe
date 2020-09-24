import { ItemOrTag, Item, parseItemOrTag, parseItem } from "../parts";
import { Ingredient, stringify, toIngredient, ItemIngredient } from "./common";
import { NonEmptyArray, of } from "fp-ts/lib/NonEmptyArray";
import { Either, chain, right, left } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { isObject, hasKeys, seqS } from "../util";

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

export function parseSmithing(u: unknown): Either<NonEmptyArray<string>, OwnSmithing> {
	return pipe(
		isObject(u),
		chain(o => hasKeys(o, "type", "base", "addition", "result")),
		chain(o =>
			seqS({
				type: o.type === "smithing" ? right(o.type) : left(of("Wrong type")),
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
