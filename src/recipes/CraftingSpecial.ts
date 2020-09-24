import { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import { Either, chain, right, left } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { isObject, hasKeys } from "../util";

export interface MCCraftingSpecial {
	type:
		| "minecraft:crafting_special_armordye"
		| "minecraft:crafting_special_bannerduplicate"
		| "minecraft:crafting_special_bookcloning"
		| "minecraft:crafting_special_firework_rocket"
		| "minecraft:crafting_special_firework_star"
		| "minecraft:crafting_special_firework_star_fade"
		| "minecraft:crafting_special_mapcloning"
		| "minecraft:crafting_special_mapextending"
		| "minecraft:crafting_special_repairitem"
		| "minecraft:crafting_special_shielddecoration"
		| "minecraft:crafting_special_shulkerboxcoloring"
		| "minecraft:crafting_special_tippedarrow"
		| "minecraft:crafting_special_suspiciousstew";
}

export interface OwnCraftingSpecial {
	type:
		| "armordye"
		| "bannerduplicate"
		| "bookcloning"
		| "firework_rocket"
		| "firework_star"
		| "firework_star_fade"
		| "mapcloning"
		| "mapextending"
		| "repairitem"
		| "shielddecoration"
		| "shulkerboxcoloring"
		| "tippedarrow"
		| "suspiciousstew";
}

export function parseCraftingSpecial(u: unknown): Either<NonEmptyArray<string>, OwnCraftingSpecial> {
	return pipe(
		isObject(u),
		chain(o => hasKeys(o, "type")),
		chain(o => {
			switch (o.type) {
				case "armordye":
				case "bannerduplicate":
				case "bookcloning":
				case "firework_rocket":
				case "firework_star":
				case "firework_star_fade":
				case "mapcloning":
				case "mapextending":
				case "repairitem":
				case "shielddecoration":
				case "shulkerboxcoloring":
				case "tippedarrow":
				case "suspiciousstew":
					return right(o as OwnCraftingSpecial);
				default:
					return left(["Unknown type"]);
			}
		}),
	);
}

export function encodeCraftingSpecial(x: OwnCraftingSpecial): MCCraftingSpecial {
	const type = ("minecraft:crafting_special_" + x.type) as MCCraftingSpecial["type"];
	return { type };
}
