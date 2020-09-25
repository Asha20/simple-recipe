import { either, left } from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import * as fs from "fs";
import * as yaml from "js-yaml";
import { parseRecipe, Recipe } from "./recipes";
import { PEither, err, ValidationError } from "./util";

type ParsedRecipes = Array<PEither<Recipe>>;

function parseYAML(yamlContent: string): ParsedRecipes {
	try {
		const x = yaml.safeLoad(yamlContent);
		if (!Array.isArray(x)) {
			return [left([err("Expected an array of recipes.")])];
		}

		if (x.length === 0) {
			return [left([err("Expected at least one recipe.")])];
		}

		return x.map(parseRecipe);
	} catch (e) {
		return [left([err("Could not parse YAML.")])];
	}
}

function addRoot(errors: NonEmptyArray<ValidationError>, index: number) {
	return errors.map(x => {
		x.origin.unshift("root", index.toString());
		return x;
	});
}

export function parseRecipes(filename: string) {
	return pipe(fs.readFileSync(filename, "utf8"), parseYAML, arr =>
		arr.map((x, i) => either.mapLeft(x, e => addRoot(e, i))),
	);
}
