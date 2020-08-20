import * as t from "io-ts";

export type OwnCraftingSpecial = t.TypeOf<typeof OwnCraftingSpecial>;
export interface MCCraftingSpecial {
	type:
		| "crafting_special_armordye"
		| "crafting_special_bannerduplicate"
		| "crafting_special_bookcloning"
		| "crafting_special_firework_rocket"
		| "crafting_special_firework_star"
		| "crafting_special_firework_star_fade"
		| "crafting_special_mapcloning"
		| "crafting_special_mapextending"
		| "crafting_special_repairitem"
		| "crafting_special_shielddecoration"
		| "crafting_special_shulkerboxcoloring"
		| "crafting_special_tippedarrow"
		| "crafting_special_suspiciousstew";
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
	const type = ("crafting_special_" + x.type) as MCCraftingSpecial["type"];
	return { type };
}

export const CraftingSpecial = new t.Type<OwnCraftingSpecial, MCCraftingSpecial, unknown>(
	"CraftingSpecial",
	OwnCraftingSpecial.is,
	OwnCraftingSpecial.validate,
	encode,
);
