import * as t from "io-ts";
import { ItemOrTag, ItemOrTags, Items } from "../parts";
import { toIngredients, Ingredient, stringify } from "./common";

export type OwnStonecutting = t.TypeOf<typeof OwnStonecutting>;
export interface MCStonecutting {
	type: "minecraft:stonecutting";
	ingredient: Ingredient;
	result: string;
	count: number;
}

const OwnStonecutting = t.type({
	type: t.literal("stonecutting"),
	ingredients: t.union([ItemOrTag, ItemOrTags]),
	result: Items,
});

function encode(x: OwnStonecutting): MCStonecutting {
	const type = ("minecraft:" + x.type) as MCStonecutting["type"];
	return {
		type,
		ingredient: toIngredients(x.ingredients),
		result: stringify(x.result),
		count: x.result.count,
	};
}

export const Stonecutting = new t.Type<OwnStonecutting, MCStonecutting, unknown>(
	"Stonecutting",
	OwnStonecutting.is,
	OwnStonecutting.validate,
	encode,
);
