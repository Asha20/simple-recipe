import { ItemOrTag, ItemOrTags, Items, parseItems, parseItemOrTag } from "../parts";
import { toIngredients, Ingredient, stringify } from "./common";
import { NonEmptyArray, of } from "fp-ts/lib/NonEmptyArray";
import { Either, chain, right, left, isRight, Right, Left, isLeft } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { isObject, hasKeys, seqS } from "../util";

export interface MCStonecutting {
	type: "minecraft:stonecutting";
	ingredient: Ingredient;
	result: string;
	count: number;
}

export interface OwnStonecutting {
	type: "stonecutting";
	ingredients: ItemOrTag | ItemOrTags;
	result: Items;
}

function parseIngredients(u: unknown): Either<NonEmptyArray<string>, ItemOrTag | ItemOrTags> {
	const itemOrTag = parseItemOrTag(u);
	if (isRight(itemOrTag)) {
		return itemOrTag;
	}

	if (!Array.isArray(u)) {
		return left(["Expected an Item, a Tag, or an array of Item or Tag."]);
	}

	const parsed = u.map((x, index) => ({ index, result: parseItemOrTag(x) }));

	if (parsed.every(x => isRight(x.result))) {
		return right(parsed.map(x => (x.result as Right<ItemOrTag>).right));
	}

	return left(
		parsed
			.filter((x): x is { index: number; result: Left<NonEmptyArray<string>> } => isLeft(x.result))
			.map(x => `${x.index}: ${x.result.left}`) as NonEmptyArray<string>,
	);
}

export function parseStonecutting(u: unknown): Either<NonEmptyArray<string>, OwnStonecutting> {
	return pipe(
		isObject(u),
		chain(o => hasKeys(o, "type", "ingredients", "result")),
		chain(o =>
			seqS({
				type: o.type === "stonecutting" ? right(o.type) : left(of("Wrong type")),
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
		ingredient: toIngredients(x.ingredients),
		result: stringify(x.result),
		count: x.result.count,
	};
}
