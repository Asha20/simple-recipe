import { chain, left, map, right } from "fp-ts/lib/Either";
import { of } from "fp-ts/lib/NonEmptyArray";
import { pipe } from "fp-ts/lib/pipeable";
import { hasKeys, isObject, PEither, seqT, err, traverse, encodeGroup } from "../util";
import { encodeCooking, MCCooking, OwnCooking, parseCooking, decodeCooking } from "./Cooking";
import {
	encodeCraftingShaped,
	MCCraftingShaped,
	OwnCraftingShaped,
	parseCraftingShaped,
	decodeCraftingShaped,
} from "./CraftingShaped";
import {
	encodeCraftingShapeless,
	MCCraftingShapeless,
	OwnCraftingShapeless,
	parseCraftingShapeless,
	decodeCraftingShapeless,
} from "./CraftingShapeless";
import {
	encodeCraftingSpecial,
	MCCraftingSpecial,
	OwnCraftingSpecial,
	parseCraftingSpecial,
	decodeCraftingSpecial,
} from "./CraftingSpecial";
import { encodeSmithing, MCSmithing, OwnSmithing, parseSmithing, decodeSmithing } from "./Smithing";
import {
	encodeStonecutting,
	MCStonecutting,
	OwnStonecutting,
	parseStonecutting,
	decodeStonecutting,
} from "./Stonecutting";
import { isItem, isTag, decodeItem, decodeTag, decodeItems, decodeTags, isItems, isTags } from "../parts";

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

const validateRecipeName = (u: unknown): PEither<string> =>
	typeof u === "string" && u.length ? right(u) : left(of(err("_name must be a non-empty string.")));

const validateType = (u: unknown): PEither<OwnRecipe["type"]> =>
	typeof u === "string" && validTypesSet.has(u) ? right(u as OwnRecipe["type"]) : left(of(err("Unknown type given.")));

function parseOwnRecipe(u: unknown, type: OwnRecipe["type"]): PEither<OwnRecipe> {
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

export function parseRecipe(u: unknown): PEither<Recipe> {
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

export function decodeRecipe(name: string, recipe: unknown): PEither<Recipe> {
	return pipe(
		isObject(recipe),
		chain(o => hasKeys(o, "type") as PEither<MCRecipe>),
		chain(
			(o): PEither<OwnRecipe> => {
				try {
					switch (o.type) {
						case "minecraft:crafting_shapeless":
							return right(decodeCraftingShapeless(o));
						case "minecraft:crafting_shaped":
							return right(decodeCraftingShaped(o));
						case "minecraft:blasting":
						case "minecraft:campfire_cooking":
						case "minecraft:smelting":
						case "minecraft:smoking":
							return right(decodeCooking(o));
						case "minecraft:smithing":
							return right(decodeSmithing(o));
						case "minecraft:stonecutting":
							return right(decodeStonecutting(o));
						case "minecraft:crafting_special_armordye":
						case "minecraft:crafting_special_bannerduplicate":
						case "minecraft:crafting_special_bookcloning":
						case "minecraft:crafting_special_firework_rocket":
						case "minecraft:crafting_special_firework_star":
						case "minecraft:crafting_special_firework_star_fade":
						case "minecraft:crafting_special_mapcloning":
						case "minecraft:crafting_special_mapextending":
						case "minecraft:crafting_special_repairitem":
						case "minecraft:crafting_special_shielddecoration":
						case "minecraft:crafting_special_shulkerboxcoloring":
						case "minecraft:crafting_special_tippedarrow":
						case "minecraft:crafting_special_suspiciousstew":
							return right(decodeCraftingSpecial(o));
						default:
							return left(of(err("Unknown type provided.")));
					}
				} catch (e) {
					return left(of(err("Could not parse recipe.")));
				}
			},
		),
		map(o =>
			traverse(o, val => {
				if (isItem(val)) {
					return decodeItem(val);
				}
				if (isTag(val)) {
					return decodeTag(val);
				}
				if (isItems(val)) {
					return decodeItems(val);
				}
				if (isTags(val)) {
					return decodeTags(val);
				}
				return val;
			}),
		),
		map(o => ({
			_name: name,
			...encodeGroup((recipe as any).group),
			...o,
		})),
	);
}
