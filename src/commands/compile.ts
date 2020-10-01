import { isRight } from "fp-ts/lib/Either";
import * as fs from "fs";
import * as glob from "glob";
import * as mkdirp from "mkdirp";
import * as path from "path";
import * as rimraf from "rimraf";
import { readAndParseRecipes } from "../parser";
import { printCompilationResults } from "../printer";
import { encodeRecipe, Recipe } from "../recipes";
import { Exists, Folder, InvalidRecipe, isRecipeFile, RecipeFile } from "./common";

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

export interface ValidRecipe {
	origin: string;
	recipe: Recipe;
}

export interface Duplicate {
	name: string;
	files: Set<string>;
	recipes: Set<Recipe>;
}

function processRecipes(outputDir: string, recipes: ValidRecipe[], inputIsFile: boolean) {
	for (const { origin, recipe } of recipes) {
		const dirname = path.dirname(origin);
		const outName = recipe._name + ".json";
		mkdirp.sync(path.resolve(outputDir, inputIsFile ? "" : dirname)); // TODO: Handle throw
		// Remove meta properties
		delete recipe._name;
		const stringRecipe = JSON.stringify(encodeRecipe(recipe), null, 2);
		const outFile = inputIsFile ? path.resolve(outputDir, outName) : path.resolve(outputDir, dirname, outName);
		fs.writeFileSync(outFile, stringRecipe);
	}
}

export function compile(input: Exists & (RecipeFile | Folder), outputDir: string) {
	const inputIsFile = isRecipeFile(input);
	const files = inputIsFile ? [input] : glob.sync("**/*.yml", { cwd: input });

	rimraf.sync(outputDir);

	const cache: Cache = new Map();

	const allRecipes: ValidRecipe[] = [];
	const duplicateRecipes: Duplicate[] = [];
	const invalidRecipes: InvalidRecipe[] = [];
	const invalidFiles = new Set<string>();

	for (const file of files) {
		const recipes = readAndParseRecipes(inputIsFile ? file : path.resolve(input, file));
		const dirname = path.dirname(file);

		for (const recipe of recipes) {
			if (isRight(recipe)) {
				const name = recipe.right._name;
				const folderCache: NonNullable<ReturnType<Cache["get"]>> = cache.get(dirname) ?? new Map();
				const nameCache = folderCache.get(name) ?? { recipes: new Set(), files: new Set() };
				const oldSize = nameCache.files.size;
				nameCache.files.add(file);
				nameCache.recipes.add(recipe.right);
				if (nameCache.files.size === oldSize || nameCache.files.size > 1) {
					duplicateRecipes.push({ name, ...nameCache });
					invalidFiles.add(file);
				}
				folderCache.set(name, nameCache);
				cache.set(dirname, folderCache);
				allRecipes.push({ origin: inputIsFile ? input : file, recipe: recipe.right });
			} else {
				invalidRecipes.push({ origin: file, errors: recipe.left });
				invalidFiles.add(file);
			}
		}
	}

	const duplicateRecipesSet = new Set<Recipe>();
	const duplicateFilesSet = new Set<string>();

	for (const dupe of duplicateRecipes) {
		dupe.recipes.forEach(duplicateRecipesSet.add, duplicateRecipesSet);
		dupe.files.forEach(duplicateFilesSet.add, duplicateFilesSet);
	}

	const uniqueRecipes = allRecipes.filter(x => !duplicateRecipesSet.has(x.recipe));
	const validFiles = files.filter(x => !invalidFiles.has(x) && !duplicateFilesSet.has(x));

	processRecipes(outputDir, uniqueRecipes, inputIsFile);
	printCompilationResults(validFiles, duplicateRecipes, invalidRecipes);
}
