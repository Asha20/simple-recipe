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

export const Recipe = t.union(
	[CraftingShaped, CraftingShapeless, CraftingSpecial, Cooking, Stonecutting, Smithing],
	"Recipe",
);
