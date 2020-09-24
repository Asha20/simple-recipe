import { ItemOrTag, ItemOrTags, Item, parseItem, parseItemOrTag } from "../parts";
import { Ingredient, toIngredients, stringify } from "./common";
import { pipe } from "fp-ts/lib/pipeable";
import { Either, chain, right, left, isRight, Right, Left, isLeft } from "fp-ts/lib/Either";
import { isObject, hasKeys, seqS } from "../util";
import { NonEmptyArray, of } from "fp-ts/lib/NonEmptyArray";

export interface MCCooking {
	type: "minecraft:blasting" | "minecraft:campfire_cooking" | "minecraft:smelting" | "minecraft:smoking";
	ingredient: Ingredient;
	experience: number;
	cookingtime: number;
	result: string;
}

export interface OwnCooking {
	type: "blasting" | "campfire_cooking" | "smelting" | "smoking";
	ingredients: ItemOrTag | ItemOrTags;
	experience: number;
	cookingtime: number;
	result: Item;
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

function parseExperience(u: unknown): Either<NonEmptyArray<string>, number> {
	const n = Number(u);
	return !Number.isNaN(n) && n > 0 ? right(n) : left(["Expected a positive number."]);
}

function parseCookingtime(u: unknown): Either<NonEmptyArray<string>, number> {
	const n = Number(u);
	return !Number.isNaN(n) && Number.isInteger(n) && n > 0 ? right(n) : left(["Expected a positive integer."]);
}

export function parseCooking(u: unknown): Either<NonEmptyArray<string>, OwnCooking> {
	return pipe(
		isObject(u),
		chain(o => hasKeys(o, "type", "ingredients", "experience", "cookingtime", "result")),
		chain(o =>
			seqS({
				type:
					o.type === "blasting" || o.type === "campfire_cooking" || o.type === "smelting" || o.type === "smoking"
						? right(o.type)
						: left(of("Wrong type")),
				ingredients: parseIngredients(o.ingredients),
				experience: parseExperience(o.experience),
				cookingtime: parseCookingtime(o.cookingtime),
				result: parseItem(o.result),
			}),
		),
	);
}

export function encodeCooking(x: OwnCooking): MCCooking {
	const type = ("minecraft:" + x.type) as MCCooking["type"];
	return {
		type,
		ingredient: toIngredients(x.ingredients),
		experience: x.experience,
		cookingtime: x.cookingtime,
		result: stringify(x.result),
	};
}
