import { chain, isRight, left, right } from "fp-ts/lib/Either";
import { of } from "fp-ts/lib/NonEmptyArray";
import { pipe } from "fp-ts/lib/pipeable";
import { Item, item, ItemOrTag, parseItem, parseItemOrTag } from "../parts";
import { parseArray } from "../parts/common";
import { encodeGroup, err, hasKeys, isObject, PEither, seqS, tryParseGroup } from "../util";
import { fromIngredientsToItemOrTags, stringify, toIngredients, Ingredient } from "./common";

export interface MCCooking {
	type: "minecraft:blasting" | "minecraft:campfire_cooking" | "minecraft:smelting" | "minecraft:smoking";
	group?: string;
	ingredient: Ingredient | Ingredient[];
	experience: number;
	cookingtime: number;
	result: string;
}

export interface OwnCooking {
	type: "blasting" | "campfire_cooking" | "smelting" | "smoking";
	group?: string;
	ingredients: ItemOrTag | ItemOrTag[];
	experience: number;
	cookingtime: number;
	result: Item;
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

function parseExperience(u: unknown): PEither<number> {
	const n = Number(u);
	return !Number.isNaN(n) && n > 0 ? right(n) : left([err("Expected a positive number.")]);
}

function parseCookingtime(u: unknown): PEither<number> {
	const n = Number(u);
	return !Number.isNaN(n) && Number.isInteger(n) && n > 0 ? right(n) : left([err("Expected a positive integer.")]);
}

export function parseCooking(u: unknown): PEither<OwnCooking> {
	return pipe(
		isObject(u),
		chain(o => hasKeys(o, "type", "ingredients", "experience", "cookingtime", "result")),
		chain(o =>
			seqS({
				type:
					o.type === "blasting" || o.type === "campfire_cooking" || o.type === "smelting" || o.type === "smoking"
						? right(o.type)
						: left(of(err("Wrong type"))),
				...tryParseGroup(o),
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
		...encodeGroup(x.group),
		ingredient: toIngredients(x.ingredients),
		experience: x.experience,
		cookingtime: x.cookingtime,
		result: stringify(x.result),
	};
}

export function decodeCooking(x: MCCooking): OwnCooking {
	const tokens = x.type.split(":");
	const type = tokens[1] as OwnCooking["type"];
	return {
		type,
		cookingtime: x.cookingtime as any,
		experience: x.experience as any,
		ingredients: fromIngredientsToItemOrTags(x.ingredient),
		result: item(x.result),
	};
}
