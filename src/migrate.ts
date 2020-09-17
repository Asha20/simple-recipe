import * as fs from "fs";
import * as glob from "glob";
import * as path from "path";
import * as assert from "assert";
import * as yaml from "js-yaml";
import * as mkdirp from "mkdirp";
import {
	MCRecipe,
	MCCraftingShapeless,
	OwnCraftingShapeless,
	MCCraftingShaped,
	OwnCraftingShaped,
	MCCooking,
	OwnCooking,
	MCSmithing,
	OwnSmithing,
	MCStonecutting,
	OwnStonecutting,
	MCCraftingSpecial,
	OwnCraftingSpecial,
	Recipe,
} from "./recipes";
import { fromIngredientsToStack, fromIngredient, fromIngredientsToItemOrTags } from "./recipes/common";
import { items, ItemOrTag, ItemOrTags, item, Item, Tag, Items, Tags } from "./parts";

export function migrate(inputDir: string, outputDir: string) {
	const groupedByDirname = glob.sync("**/*.json", { cwd: inputDir }).reduce<Map<string, string[]>>((acc, file) => {
		const dirname = path.dirname(file);
		const array = acc.get(dirname) ?? [];
		array.push(file);
		acc.set(dirname, array);
		return acc;
	}, new Map());

	for (const [dirname, files] of groupedByDirname) {
		const recipes = files.map(file => {
			const recipeName = path.basename(file).replace(".json", "");
			const fileContent = fs.readFileSync(path.resolve(inputDir, file), "utf8");
			const json = JSON.parse(fileContent) as MCRecipe;
			return convertRecipe(recipeName, json);
		});
		mkdirp.sync(path.resolve(outputDir, dirname));
		fs.writeFileSync(path.resolve(outputDir, dirname, "index.yml"), yaml.dump(recipes));
	}
}

function stringifyName(x: { name: string; namespace: string }) {
	const { name, namespace } = x;
	return namespace === "minecraft" ? name : namespace + ":" + name;
}

function convertRecipe(name: string, recipe: MCRecipe): Recipe {
	const ownRecipe = (() => {
		switch (recipe.type) {
			case "minecraft:crafting_shapeless":
				return craftingShapeless(recipe);
			case "minecraft:crafting_shaped":
				return craftingShaped(recipe);
			case "minecraft:blasting":
			case "minecraft:campfire_cooking":
			case "minecraft:smelting":
			case "minecraft:smoking":
				return cooking(recipe);
			case "minecraft:smithing":
				return smithing(recipe);
			case "minecraft:stonecutting":
				return stonecutting(recipe);
			default:
				return craftingSpecial(recipe);
		}
	})();

	traverse(ownRecipe, val => {
		if (Item.is(val)) {
			return stringifyName(val);
		}
		if (Tag.is(val)) {
			return "+" + stringifyName(val);
		}
		if (Items.is(val)) {
			return `${val.count} ${stringifyName(val)}`;
		}
		if (Tags.is(val)) {
			return `${val.count} +${stringifyName(val)}`;
		}
		return val;
	});

	return Object.assign({ _name: name }, (recipe as any).group ? { group: (recipe as any).group } : {}, ownRecipe);
}

function craftingShapeless(x: MCCraftingShapeless): OwnCraftingShapeless {
	return {
		type: "crafting_shapeless",
		ingredients: fromIngredientsToStack(x.ingredients),
		result: items(x.result.item, x.result.count ?? 1),
	};
}

function craftingShaped(x: MCCraftingShaped): OwnCraftingShaped {
	const ownKey: Record<string, ItemOrTag | ItemOrTags> = {};
	for (const [key, value] of Object.entries(x.key)) {
		ownKey[key] = fromIngredientsToItemOrTags(value);
	}

	return {
		type: "crafting_shaped",
		pattern: x.pattern,
		key: ownKey,
		result: items(x.result.item, x.result.count ?? 1),
	};
}

function cooking(x: MCCooking): OwnCooking {
	const tokens = x.type.split(":");
	const type = tokens[1] as OwnCooking["type"];
	return {
		type,
		cookingtime: x.cookingtime as any,
		experience: x.experience as any,
		ingredients: fromIngredientsToItemOrTags(x.ingredient),
		result: item(x.result),
	};
}

function smithing(x: MCSmithing): OwnSmithing {
	assert(!Array.isArray(x.base));
	assert(!Array.isArray(x.addition));
	return {
		type: "smithing",
		base: fromIngredient(x.base),
		addition: fromIngredient(x.addition),
		result: item(x.result.item),
	};
}

function stonecutting(x: MCStonecutting): OwnStonecutting {
	return {
		type: "stonecutting",
		ingredients: fromIngredientsToStack(x.ingredient) as any,
		result: items(x.result, x.count),
	};
}

function craftingSpecial(x: MCCraftingSpecial): OwnCraftingSpecial {
	const type = x.type.replace("minecraft:crafting_special_", "") as OwnCraftingSpecial["type"];
	return { type };
}

function traverse(obj: any, fn: (value: any) => any) {
	for (const [key, value] of Object.entries(obj)) {
		if (typeof value === "object" && value !== null) {
			traverse(value, fn);
		}
		obj[key] = fn(value);
	}
	return obj;
}
