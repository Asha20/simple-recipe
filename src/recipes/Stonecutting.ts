import * as t from "io-ts";
import { ItemOrTag, ItemOrTags, ItemStack } from "../parts";

export type ItemIngredient = { item: string };
export type TagIngredient = { tag: string };
export type Ingredient = ItemIngredient | TagIngredient | Ingredient[];

export type OwnStonecutting = t.TypeOf<typeof OwnStonecutting>;
export interface MCStonecutting {
	type: "stonecutting";
	ingredient: Ingredient[];
	result: string;
	count: number;
}

function toIngredients(itemOrTags: ItemOrTag | ItemOrTags): Ingredient[] {
	const boxed = Array.isArray(itemOrTags) ? itemOrTags : [itemOrTags];
	return boxed.map(x => (x.type === "item" ? { item: x.name } : { tag: x.name }));
}

const OwnStonecutting = t.type({
	type: t.literal("stonecutting"),
	ingredients: t.union([ItemOrTag, ItemOrTags]),
	result: ItemStack,
});

function encode(x: OwnStonecutting): MCStonecutting {
	return {
		type: x.type,
		ingredient: toIngredients(x.ingredients),
		result: x.result.name,
		count: x.result.count,
	};
}

export const Stonecutting = new t.Type<OwnStonecutting, MCStonecutting, unknown>(
	"Stonecutting",
	OwnStonecutting.is,
	OwnStonecutting.validate,
	encode,
);
