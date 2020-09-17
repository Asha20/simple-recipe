import * as assert from "assert";
import { isRight } from "fp-ts/lib/Either";
import { CraftingSpecial } from "./CraftingSpecial";

const types = [
	"armordye",
	"bannerduplicate",
	"bookcloning",
	"firework_rocket",
	"firework_star",
	"firework_star_fade",
	"mapcloning",
	"mapextending",
	"repairitem",
	"shielddecoration",
	"shulkerboxcoloring",
	"tippedarrow",
	"suspiciousstew",
] as const;

describe("Special crafting", () => {
	test("all special crafting types", () => {
		for (const type of types) {
			const recipe = CraftingSpecial.decode({ type });
			expect(recipe).toBeRight({ type });
			assert(isRight(recipe));
			expect(CraftingSpecial.encode(recipe.right)).toEqual({
				type: "minecraft:crafting_special_" + type,
			});
		}
	});
});
