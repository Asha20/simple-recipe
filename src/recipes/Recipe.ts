import * as t from "io-ts";
import { CraftingShaped, MCCraftingShaped, OwnCraftingShaped } from "./CraftingShaped";
import { CraftingShapeless, MCCraftingShapeless, OwnCraftingShapeless } from "./CraftingShapeless";
import { Cooking, MCCooking, OwnCooking } from "./Cooking";
import { Stonecutting, MCStonecutting, OwnStonecutting } from "./Stonecutting";
import { Smithing, MCSmithing, OwnSmithing } from "./Smithing";
import { CraftingSpecial, MCCraftingSpecial, OwnCraftingSpecial } from "./CraftingSpecial";

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

export type RecipeMeta = t.TypeOf<typeof RecipeMeta>;
export type Recipe = t.TypeOf<typeof Recipe>;

const RecipeMeta = t.type({
	_name: t.string,
});

const Optional = t.partial({
	group: t.string,
});

const AnyRecipe = t.union(
	[CraftingShaped, CraftingShapeless, CraftingSpecial, Cooking, Stonecutting, Smithing],
	"AnyRecipe",
);

export const Recipe = t.intersection([AnyRecipe, RecipeMeta, Optional], "Recipe");
