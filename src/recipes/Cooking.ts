import { chain, isRight, left, right } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { Item, item, ItemOrTag, parseItem, parseItemOrTag } from "../parts";
import { parseArray, stringifyName } from "../parts/common";
import { encodeGroup, err, hasKeys, isObject, leftErr, parseType, PEither, seqS, tryParseGroup } from "../util";
import * as ingredient from "./ingredient";
import { Ingredient } from "./ingredient";

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
	return !Number.isNaN(n) && n > 0 ? right(n) : leftErr("Expected a positive number.");
}

function parseCookingtime(u: unknown): PEither<number> {
	const n = Number(u);
	return !Number.isNaN(n) && Number.isInteger(n) && n > 0 ? right(n) : leftErr("Expected a positive integer.");
}

export function parseCooking(u: unknown): PEither<OwnCooking> {
	return pipe(
		isObject(u),
		chain(o => hasKeys(o, "type", "ingredients", "experience", "cookingtime", "result")),
		chain(o =>
			seqS({
				type: parseType(o.type, "blasting", "campfire_cooking", "smelting", "smoking"),
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
		ingredient: ingredient.from(x.ingredients),
		experience: x.experience,
		cookingtime: x.cookingtime,
		result: stringifyName(x.result, true),
	};
}

export function decodeCooking(x: MCCooking): OwnCooking {
	const tokens = x.type.split(":");
	const type = tokens[1] as OwnCooking["type"];
	return {
		type,
		cookingtime: x.cookingtime as any,
		experience: x.experience as any,
		ingredients: ingredient.toItemOrTags(x.ingredient),
		result: item(x.result),
	};
}
