import * as t from "io-ts";
import { ItemOrTag, ItemOrTags, Item } from "../parts";
import { Ingredient, toIngredients, stringify } from "./common";
import { pipe } from "fp-ts/lib/pipeable";
import { Either, chain } from "fp-ts/lib/Either";

export type OwnCooking = t.TypeOf<typeof OwnCooking>;
export interface MCCooking {
	type: "minecraft:blasting" | "minecraft:campfire_cooking" | "minecraft:smelting" | "minecraft:smoking";
	ingredient: Ingredient;
	experience: number;
	cookingtime: number;
	result: string;
}

const OwnCooking = t.type({
	type: t.keyof({
		blasting: null,
		campfire_cooking: null,
		smelting: null,
		smoking: null,
	}),
	ingredients: t.union([ItemOrTag, ItemOrTags]),
	experience: t.Int,
	cookingtime: t.Int,
	result: Item,
});

function encode(x: OwnCooking): MCCooking {
	const type = ("minecraft:" + x.type) as MCCooking["type"];
	return {
		type,
		ingredient: toIngredients(x.ingredients),
		experience: x.experience,
		cookingtime: x.cookingtime,
		result: stringify(x.result),
	};
}

function validate(u: unknown, c: t.Context): Either<t.Errors, OwnCooking> {
	return pipe(
		OwnCooking.validate(u, c),
		chain(x => {
			if (x.cookingtime <= 0) {
				return t.failure(u, c, "cookingtime must be a positive integer.");
			}

			if (x.experience <= 0) {
				return t.failure(u, c, "experience must be a positive integer.");
			}

			return t.success(x);
		}),
	);
}

export const Cooking = new t.Type<OwnCooking, MCCooking, unknown>("Cooking", OwnCooking.is, validate, encode);
