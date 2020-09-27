import { isRight } from "fp-ts/lib/Either";
import * as fs from "fs";
import * as glob from "glob";
import * as mkdirp from "mkdirp";
import * as path from "path";
import * as rimraf from "rimraf";
import { parseRecipes } from "../parser";
import { encodeRecipe, Recipe } from "../recipes";
import { ValidationError } from "../util";
import { printCompilationResults } from "../printer";

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

export interface FailedRecipe {
	origin: string;
	errors: ValidationError[];
}

export interface Duplicate {
	name: string;
	files: Set<string>;
	recipes: Set<Recipe>;
}

function processRecipes(outputDir: string, recipes: ValidRecipe[]) {
	for (const { origin, recipe } of recipes) {
		const dirname = path.dirname(origin);
		const outFile = recipe._name + ".json";
		mkdirp.sync(path.resolve(outputDir, dirname)); // TODO: Handle throw
		// Remove meta properties
		delete recipe._name;
		const stringRecipe = JSON.stringify(encodeRecipe(recipe), null, 2);
		fs.writeFileSync(path.resolve(outputDir, dirname, outFile), stringRecipe);
	}
}

export function compile(inputDir: string, outputDir: string) {
	const files = glob.sync("**/*.yml", { cwd: inputDir });

	rimraf.sync(outputDir);

	const cache: Cache = new Map();

	const allRecipes: ValidRecipe[] = [];
	const duplicateRecipes: Duplicate[] = [];
	const failedRecipes: FailedRecipe[] = [];
	const duplicateSet = new Set<Recipe>();
	const invalidFiles = new Set<string>();

	for (const file of files) {
		const recipes = parseRecipes(path.resolve(inputDir, file));
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
				allRecipes.push({ origin: file, recipe: recipe.right });
			} else {
				failedRecipes.push({ origin: file, errors: recipe.left });
				invalidFiles.add(file);
			}
		}
	}

	for (const dupe of duplicateRecipes) {
		dupe.recipes.forEach(duplicateSet.add, duplicateSet);
	}
	const uniqueRecipes = allRecipes.filter(x => !duplicateSet.has(x.recipe));
	const validFiles = files.filter(x => !invalidFiles.has(x));

	processRecipes(outputDir, uniqueRecipes);
	printCompilationResults(validFiles, duplicateRecipes, failedRecipes);
}
