import * as path from "path";
import * as glob from "glob";
import * as mkdirp from "mkdirp";
import * as rimraf from "rimraf";
import * as fs from "fs";
import * as chalk from "chalk";
import { watch } from "./watcher";
import { parseRecipes } from "./parser";
import { isRight } from "fp-ts/lib/Either";
import { Recipe } from "./recipes";
import { convert } from "./converter";

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
	message: string;
}

interface Duplicate {
	name: string;
	files: Set<string>;
	recipes: Set<Recipe>;
}

function main() {
	if (process.argv.length < 4) {
		console.error("Enter an input and an output directory.");
		return process.exit(1);
	}

	const inputDir = path.resolve(process.cwd(), process.argv[2]);
	const outputDir = path.resolve(process.cwd(), process.argv[3]);
	const converting = process.argv[4] === "c";

	function handleEvent() {
		glob("**/*.yml", { cwd: inputDir }, (err, files) => {
			if (err) throw err;

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
						failedRecipes.push({ origin: file, message: recipe.left });
						invalidFiles.add(file);
					}
				}
			}

			for (const dupe of duplicateRecipes) {
				dupe.recipes.forEach(duplicateSet.add, duplicateSet);
			}
			const uniqueRecipes = allRecipes.filter(x => !duplicateSet.has(x.recipe));
			const validFiles = files.filter(x => !invalidFiles.has(x));

			processRecipes(uniqueRecipes);

			console.clear();
			printValidFiles(validFiles);
			printDuplicates(duplicateRecipes);
			console.log("\n\n");
			printFailedRecipes(failedRecipes);
		});
	}

	function processRecipes(recipes: ValidRecipe[]) {
		for (const { origin, recipe } of recipes) {
			const dirname = path.dirname(origin);
			const outFile = recipe._name + ".json";
			mkdirp.sync(path.resolve(outputDir, dirname)); // TODO: Handle throw
			// Remove meta properties
			delete recipe._name;
			const stringRecipe = JSON.stringify(Recipe.encode(recipe), null, 2);
			fs.writeFileSync(path.resolve(outputDir, dirname, outFile), stringRecipe);
		}
	}

	function printDuplicates(duplicates: Duplicate[]) {
		if (duplicates.length === 0) {
			return;
		}

		console.log("  Name conflicts:\n");

		for (const dupe of duplicates) {
			console.log(chalk`Recipe {yellow ${dupe.name}} in files: {yellow ${[...dupe.files].join(", ")}}`);
		}
	}

	function printValidFiles(files: string[]) {
		for (const file of files.sort()) {
			console.log(chalk.green(`  ✓ ${file}`));
		}
	}

	function printFailedRecipes(fails: FailedRecipe[]) {
		const groupedByOrigin = fails.reduce<Map<string, string[]>>((acc, x) => {
			const array = acc.get(x.origin) ?? [];
			array.push(x.message);
			acc.set(x.origin, array);
			return acc;
		}, new Map());

		for (const [origin, messages] of groupedByOrigin) {
			console.log(chalk.red(`  ✗ ${origin}\n`));
			for (const message of messages) {
				const [path, msg] = message.split(": ");
				console.log(chalk`{cyan ${path}:} {white ${msg}}`);
			}
			console.log("\n\n");
		}
	}

	if (converting) {
		convert(inputDir, outputDir);
	} else {
		watch(inputDir, handleEvent);
	}
}

if (!module.parent) {
	main();
}
