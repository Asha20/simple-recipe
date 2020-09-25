import * as chalk from "chalk";
import { isRight } from "fp-ts/lib/Either";
import * as fs from "fs";
import * as glob from "glob";
import * as mkdirp from "mkdirp";
import * as path from "path";
import * as rimraf from "rimraf";
import { parseRecipes } from "../parser";
import { encodeRecipe, Recipe } from "../recipes";
import { log, ValidationError } from "../util";

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

interface FailedRecipe {
	origin: string;
	errors: ValidationError[];
}

interface Duplicate {
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

function printDuplicates(duplicates: Duplicate[]) {
	if (duplicates.length === 0) {
		return;
	}

	log("  Name conflicts:\n");

	for (const dupe of duplicates) {
		log(chalk`Recipe {yellow ${dupe.name}} in files: {yellow ${[...dupe.files].join(", ")}}`);
	}
}

function printValidFiles(files: string[]) {
	for (const file of files.sort()) {
		log(chalk.green(`  ✓ ${file}`));
	}
}

const identifierRegex = /^[a-z_]\w*$/i;

function joinPath(path: string[]) {
	let result = path[0] ?? "";
	for (let i = 1; i < path.length; i++) {
		const part = path[i];
		if (Number.isInteger(+part)) {
			result += `[${part}]`;
		} else if (identifierRegex.test(part)) {
			result += `.${part}`;
		} else {
			result += `["${part}"]`;
		}
	}
	return result;
}

function printFailedRecipes(fails: FailedRecipe[]) {
	const groupedByOrigin = fails.reduce<Map<string, ValidationError[][]>>((acc, x) => {
		const array = acc.get(x.origin) ?? [];
		array.push(x.errors);
		acc.set(x.origin, array);
		return acc;
	}, new Map());

	for (const [origin, errorGroup] of groupedByOrigin) {
		log(chalk.red(`  ✗ ${origin}\n`));
		for (const errors of errorGroup) {
			for (const error of errors) {
				const path = joinPath(error.origin);
				const colon = path.length ? ":" : "";
				log(chalk`{cyan ${path}${colon}} {white ${error.message}}`);
			}
		}
		log("\n\n");
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
				const folderCache: ReturnType<Cache["get"]> = cache.get(dirname) ?? new Map();
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

	printValidFiles(validFiles);
	printDuplicates(duplicateRecipes);
	log("\n\n");
	printFailedRecipes(failedRecipes);
}
