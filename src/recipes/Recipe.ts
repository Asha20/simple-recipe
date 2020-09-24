import { parseCraftingShaped, MCCraftingShaped, OwnCraftingShaped, encodeCraftingShaped } from "./CraftingShaped";
import {
	parseCraftingShapeless,
	MCCraftingShapeless,
	OwnCraftingShapeless,
	encodeCraftingShapeless,
} from "./CraftingShapeless";
import { parseCooking, MCCooking, OwnCooking, encodeCooking } from "./Cooking";
import { parseStonecutting, MCStonecutting, OwnStonecutting, encodeStonecutting } from "./Stonecutting";
import { parseSmithing, MCSmithing, OwnSmithing, encodeSmithing } from "./Smithing";
import { parseCraftingSpecial, MCCraftingSpecial, OwnCraftingSpecial, encodeCraftingSpecial } from "./CraftingSpecial";
import { Either, chain, left, isRight, right, map } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { isObject, hasKeys, seqT } from "../util";
import { NonEmptyArray, of } from "fp-ts/lib/NonEmptyArray";

export type OwnRecipe =
	| OwnCraftingShaped
	| OwnCraftingShapeless
	| OwnCraftingSpecial
	| OwnCooking
	| OwnStonecutting
	| OwnSmithing;

export type MCRecipe =
	| MCCraftingShaped
	| MCCraftingShapeless
	| MCCraftingSpecial
	| MCCooking
	| MCStonecutting
	| MCSmithing;

export interface RecipeMeta {
	_name: string;
}

const validTypes = [
	"armordye",
	"bannerduplicate",
	"blasting",
	"bookcloning",
	"campfire_cooking",
	"crafting_shaped",
	"crafting_shapeless",
	"firework_rocket",
	"firework_star",
	"firework_star_fade",
	"mapcloning",
	"mapextending",
	"repairitem",
	"shielddecoration",
	"shulkerboxcoloring",
	"smelting",
	"smithing",
	"smoking",
	"stonecutting",
	"suspiciousstew",
	"tippedarrow",
];

const validTypesSet = new Set(validTypes);

export type Recipe = OwnRecipe & RecipeMeta;

const validateRecipeName = (u: unknown): Either<NonEmptyArray<string>, string> =>
	typeof u === "string" && u.length ? right(u) : left(of("_name must be a non-empty string."));

const validateType = (u: unknown): Either<NonEmptyArray<string>, OwnRecipe["type"]> =>
	typeof u === "string" && validTypesSet.has(u) ? right(u as OwnRecipe["type"]) : left(of("Unknown type given."));

function parseOwnRecipe(u: unknown, type: OwnRecipe["type"]): Either<NonEmptyArray<string>, OwnRecipe> {
	switch (type) {
		case "crafting_shaped":
			return parseCraftingShaped(u);
		case "crafting_shapeless":
			return parseCraftingShapeless(u);
		case "smithing":
			return parseSmithing(u);
		case "stonecutting":
			return parseStonecutting(u);
		case "smelting":
		case "smoking":
		case "blasting":
		case "campfire_cooking":
			return parseCooking(u);
		default:
			return parseCraftingSpecial(u);
	}
}

export function parseRecipe(u: unknown): Either<NonEmptyArray<string>, Recipe> {
	return pipe(
		isObject(u),
		chain(o => hasKeys(o, "_name", "type")),
		chain(o => seqT(right(o), validateRecipeName(o._name), validateType(o.type))),
		chain(([o, _name, type]) => seqT(right(_name), parseOwnRecipe(o, type))),
		map(([_name, recipe]) => ({ _name, ...recipe })),
	);
}

export function encodeRecipe(recipe: OwnRecipe): MCRecipe {
	switch (recipe.type) {
		case "crafting_shaped":
			return encodeCraftingShaped(recipe);
		case "crafting_shapeless":
			return encodeCraftingShapeless(recipe);
		case "smithing":
			return encodeSmithing(recipe);
		case "stonecutting":
			return encodeStonecutting(recipe);
		case "smelting":
		case "smoking":
		case "blasting":
		case "campfire_cooking":
			return encodeCooking(recipe);
		default:
			return encodeCraftingSpecial(recipe);
	}
}

export function parseRecipes(u: unknown): Either<NonEmptyArray<string>, OwnRecipe[]> {
	return pipe(Array.isArray(u) ? right(u) : left(["Expected an array."]));
}
