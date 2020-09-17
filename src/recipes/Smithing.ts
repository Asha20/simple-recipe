import * as t from "io-ts";
import { ItemOrTag, Item } from "../parts";
import { Ingredient, stringify, toIngredient, ItemIngredient } from "./common";

export type OwnSmithing = t.TypeOf<typeof OwnSmithing>;
export interface MCSmithing {
	type: "minecraft:smithing";
	base: Ingredient;
	addition: Ingredient;
	result: ItemIngredient;
}

const OwnSmithing = t.type({
	type: t.literal("smithing"),
	base: ItemOrTag,
	addition: ItemOrTag,
	result: Item,
});

function encode(x: OwnSmithing): MCSmithing {
	const type = ("minecraft:" + x.type) as MCSmithing["type"];
	return {
		type,
		base: toIngredient(x.base),
		addition: toIngredient(x.addition),
		result: { item: stringify(x.result) },
	};
}

export const Smithing = new t.Type<OwnSmithing, MCSmithing, unknown>(
	"Smithing",
	OwnSmithing.is,
	OwnSmithing.validate,
	encode,
);
