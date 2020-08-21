import * as t from "io-ts";

export type OwnCraftingSpecial = t.TypeOf<typeof OwnCraftingSpecial>;
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

const OwnCraftingSpecial = t.type({
	type: t.keyof({
		armordye: null,
		bannerduplicate: null,
		bookcloning: null,
		firework_rocket: null,
		firework_star: null,
		firework_star_fade: null,
		mapcloning: null,
		mapextending: null,
		repairitem: null,
		shielddecoration: null,
		shulkerboxcoloring: null,
		tippedarrow: null,
		suspiciousstew: null,
	}),
});

function encode(x: OwnCraftingSpecial): MCCraftingSpecial {
	const type = ("minecraft:crafting_special_" + x.type) as MCCraftingSpecial["type"];
	return { type };
}

export const CraftingSpecial = new t.Type<OwnCraftingSpecial, MCCraftingSpecial, unknown>(
	"CraftingSpecial",
	OwnCraftingSpecial.is,
	OwnCraftingSpecial.validate,
	encode,
);
