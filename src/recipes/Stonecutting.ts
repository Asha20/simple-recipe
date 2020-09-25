import { chain, isLeft, isRight, left, Left, right, Right } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { NonEmptyArray, of } from "fp-ts/lib/NonEmptyArray";
import { ItemOrTag, ItemOrTags, Items, parseItemOrTag, parseItems } from "../parts";
import { hasKeys, isObject, PEither, seqS, err, ValidationError } from "../util";
import { Ingredient, stringify, toIngredients } from "./common";

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

function parseIngredients(u: unknown): PEither<ItemOrTag | ItemOrTags> {
	const itemOrTag = parseItemOrTag(u);
	if (isRight(itemOrTag)) {
		return itemOrTag;
	}

	if (!Array.isArray(u)) {
		return left([err("Expected an Item, a Tag, or an array of Item or Tag.")]);
	}

	const parsed = u.map((x, index) => ({ index, result: parseItemOrTag(x) }));

	if (parsed.every(x => isRight(x.result))) {
		return right(parsed.map(x => (x.result as Right<ItemOrTag>).right));
	}

	return left(
		parsed
			.filter((x): x is { index: number; result: Left<NonEmptyArray<ValidationError>> } => isLeft(x.result))
			.flatMap(x => x.result.left.map(y => err(y.message, [x.index.toString(), ...y.origin]))) as NonEmptyArray<
			ValidationError
		>,
	);
}

export function parseStonecutting(u: unknown): PEither<OwnStonecutting> {
	return pipe(
		isObject(u),
		chain(o => hasKeys(o, "type", "ingredients", "result")),
		chain(o =>
			seqS({
				type: o.type === "stonecutting" ? right(o.type) : left(of(err("Wrong type"))),
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
