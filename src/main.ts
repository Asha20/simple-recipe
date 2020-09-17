import * as path from "path";
import * as glob from "glob";
import * as mkdirp from "mkdirp";
import * as rimraf from "rimraf";
import * as fs from "fs";
import { watch } from "./watcher";
import { parseRecipes } from "./parser";
import { isRight } from "fp-ts/lib/Either";
import { Recipe } from "./recipes";

type Cache = Map<
	string,
	Map<
		string,
		{
			recipes: Set<Recipe>;
			files: Set<string>;
		}
	>
>;

interface ValidRecipe {
	origin: string;
	recipe: Recipe;
}

interface Duplicate {
	name: string;
	files: Set<string>;
	recipes: Set<Recipe>;
}

function main() {
	if (process.argv.length !== 4) {
		console.error("Enter an input and an output directory.");
		return process.exit(1);
	}

	const inputDir = path.resolve(process.cwd(), process.argv[2]);
	const outputDir = path.resolve(process.cwd(), process.argv[3]);

	function handleEvent() {
		glob("**/*.yml", { cwd: inputDir }, (err, files) => {
			if (err) throw err;

			rimraf.sync(outputDir);

			const cache: Cache = new Map();

			const allRecipes: ValidRecipe[] = [];
			const duplicateRecipes: Duplicate[] = [];
			const duplicateSet = new Set<Recipe>();

			for (const file of files) {
				const recipes = parseRecipes(path.resolve(inputDir, file));
				const dirname = path.dirname(file);

				for (const recipe of recipes) {
					if (isRight(recipe)) {
						const name = recipe.right._name;
						const folderCache: ReturnType<Cache["get"]> = cache.get(dirname) ?? new Map();
						const nameCache = folderCache.get(name) ?? { recipes: new Set(), files: new Set() };
						const oldSize = nameCache.files.size;
						nameCache.files.add(file);
						nameCache.recipes.add(recipe.right);
						if (nameCache.files.size === oldSize || nameCache.files.size > 1) {
							duplicateRecipes.push({ name, ...nameCache });
						}
						folderCache.set(name, nameCache);
						cache.set(dirname, folderCache);
						allRecipes.push({ origin: file, recipe: recipe.right });
					}
				}
			}

			for (const dupe of duplicateRecipes) {
				dupe.recipes.forEach(duplicateSet.add, duplicateSet);
			}
			const uniqueRecipes = allRecipes.filter(x => !duplicateSet.has(x.recipe));

			processRecipes(uniqueRecipes);
			printDuplicates(duplicateRecipes);
		});
	}

	function processRecipes(recipes: ValidRecipe[]) {
		for (const { origin, recipe } of recipes) {
			const dirname = path.dirname(origin);
			const outFile = recipe._name + ".json";
			mkdirp.sync(path.resolve(outputDir, dirname)); // TODO: Handle throw
			const stringRecipe = JSON.stringify(Recipe.encode(recipe), null, 2);
			fs.writeFileSync(path.resolve(outputDir, dirname, outFile), stringRecipe);
			console.log(`Successfully created ${outFile}`);
		}
	}

	function printDuplicates(duplicates: Duplicate[]) {
		for (const dupe of duplicates) {
			console.error(`Name conflict: "${dupe.name}" present in files:`, [...dupe.files].join(", "));
		}
	}

	watch(inputDir, handleEvent);
}

if (!module.parent) {
	main();
}
