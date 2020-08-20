import * as t from "io-ts";
import { ItemOrTag, Item } from "../parts";
import { Ingredient, stringify, toIngredient } from "./common";

export type OwnSmithing = t.TypeOf<typeof OwnSmithing>;
export interface MCSmithing {
	type: "smithing";
	base: Ingredient;
	addition: Ingredient;
	result: string;
}

const OwnSmithing = t.type({
	type: t.literal("smithing"),
	base: ItemOrTag,
	addition: ItemOrTag,
	result: Item,
});

function encode(x: OwnSmithing): MCSmithing {
	return {
		type: x.type,
		base: toIngredient(x.base),
		addition: toIngredient(x.addition),
		result: stringify(x.result),
	};
}

export const Smithing = new t.Type<OwnSmithing, MCSmithing, unknown>(
	"Smithing",
	OwnSmithing.is,
	OwnSmithing.validate,
	encode,
);
