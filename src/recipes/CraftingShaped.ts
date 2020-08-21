import * as t from "io-ts";
import { Items, ItemOrTag, ItemOrTags } from "../parts";
import { Ingredient, toIngredients, stringify } from "./common";
import { Either, chain } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";

export type OwnCraftingShaped = t.TypeOf<typeof OwnCraftingShaped>;
export interface MCCraftingShaped {
	type: "minecraft:crafting_shaped";
	pattern: string[];
	key: Record<string, Ingredient>;
	result: {
		count: number;
		item: string;
	};
}

const OwnCraftingShaped = t.type({
	type: t.literal("crafting_shaped"),
	pattern: t.array(t.string),
	key: t.record(t.string, t.union([ItemOrTag, ItemOrTags], "ItemOrTag | Array<ItemOrTag>")),
	result: Items,
});

function encode(x: OwnCraftingShaped): MCCraftingShaped {
	const type = ("minecraft:" + x.type) as MCCraftingShaped["type"];
	const keyRecord: MCCraftingShaped["key"] = {};

	for (const key of Object.keys(x.key)) {
		keyRecord[key] = toIngredients(x.key[key]);
	}

	return {
		type,
		pattern: x.pattern,
		key: keyRecord,
		result: {
			count: x.result.count,
			item: stringify(x.result),
		},
	};
}

function validate(u: unknown, c: t.Context): Either<t.Errors, OwnCraftingShaped> {
	return pipe(
		OwnCraftingShaped.validate(u, c),
		chain(x => {
			if (x.pattern.length === 0 || x.pattern.length > 3) {
				return t.failure(u, c, "Pattern height must be 1-3.");
			}

			const columns = x.pattern[0].length;
			if (!x.pattern.every(row => row.length === columns)) {
				return t.failure(u, c, "All strings in pattern must have same length.");
			}

			if (columns === 0 || columns > 3) {
				return t.failure(u, c, "Pattern width must be 1-3.");
			}

			const charsInPattern = new Set<string>();

			for (const row of x.pattern) {
				for (const char of row) {
					if (char !== " " && !(char in x.key)) {
						return t.failure(u, c, `Unknown key found in pattern: "${char}".`);
					}
					charsInPattern.add(char);
				}
			}

			for (const key of Object.keys(x.key)) {
				if (key === " ") {
					return t.failure(u, c, "Cannot use space as a key.");
				}

				if (key.length !== 1) {
					return t.failure(u, c, `Key doesn't have length of 1: "${key}".`);
				}

				if (!charsInPattern.has(key)) {
					return t.failure(u, c, `"${key}" exists in key but not in pattern.`);
				}
			}

			return t.success(x);
		}),
	);
}

export const CraftingShaped = new t.Type<OwnCraftingShaped, MCCraftingShaped, unknown>(
	"CraftingShaped",
	OwnCraftingShaped.is,
	validate,
	encode,
);
