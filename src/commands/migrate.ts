import * as fs from "fs";
import * as glob from "glob";
import * as yaml from "js-yaml";
import * as mkdirp from "mkdirp";
import * as path from "path";
import { decodeRecipe, MCRecipe, Recipe } from "../recipes";
import { Folder, InvalidRecipe } from "./common";
import { left, isRight, isLeft, Left, Right } from "fp-ts/lib/Either";
import { of, NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import { err, ValidationError } from "../util";
import { printMigrationResults } from "../printer";

export function migrate(inputDir: Folder, outputDir: string) {
	const groupedByDirname = glob.sync("**/*.json", { cwd: inputDir }).reduce<Map<string, string[]>>((acc, file) => {
		const dirname = path.dirname(file);
		const array = acc.get(dirname) ?? [];
		array.push(file);
		acc.set(dirname, array);
		return acc;
	}, new Map());

	const allValidRecipes: string[] = [];
	const allInvalidRecipes: InvalidRecipe[] = [];

	for (const [dirname, files] of groupedByDirname) {
		const recipes = files.map(file => {
			const recipeName = path.basename(file).replace(".json", "");
			const fileContent = fs.readFileSync(path.resolve(inputDir, file), "utf8");
			try {
				const json = JSON.parse(fileContent) as MCRecipe;
				return { origin: file, result: decodeRecipe(recipeName, json) };
			} catch (e) {
				return { origin: file, result: left(of(err("Invalid JSON was provided."))) };
			}
		});

		const validRecipes = recipes.filter((x): x is { origin: string; result: Right<Recipe> } => isRight(x.result));
		const invalidRecipes = recipes.filter((x): x is { origin: string; result: Left<NonEmptyArray<ValidationError>> } =>
			isLeft(x.result),
		);

		const validRecipeDump = validRecipes.map(x => x.result.right);
		if (validRecipes.length) {
			mkdirp.sync(path.resolve(outputDir, dirname));
		}
		fs.writeFileSync(path.resolve(outputDir, dirname, "index.yml"), yaml.dump(validRecipeDump));

		allValidRecipes.push(...validRecipes.map(x => x.origin));
		allInvalidRecipes.push(...invalidRecipes.map(x => ({ origin: x.origin, errors: x.result.left })));
	}

	printMigrationResults(allValidRecipes, allInvalidRecipes);
}
