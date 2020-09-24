import * as fs from "fs";
import * as yaml from "js-yaml";
import { left, Either, either } from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import { Recipe, parseRecipe } from "./recipes";
import { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";

type ParsedRecipes = Array<Either<NonEmptyArray<string>, Recipe>>;

function parseYAML(yamlContent: string): ParsedRecipes {
	try {
		const x = yaml.safeLoad(yamlContent);
		if (!Array.isArray(x)) {
			return [left(["Expected an array of recipes."])];
		}

		if (x.length === 0) {
			return [left(["Expected at least one recipe."])];
		}

		return x.map(parseRecipe);
	} catch (e) {
		return [left(["Could not parse YAML."])];
	}
}

function stringifyError(errors: NonEmptyArray<string>, index: number) {
	let origin = `root[${index}]`;

	return errors.map(x => `${origin}: ${x}`).join("\n");
}

// prettier-ignore
export function parseRecipes(filename: string) {
	return pipe(
		fs.readFileSync(filename, "utf8"),
		parseYAML,
		arr => arr.map((x, i) =>
			either.mapLeft(x, e => stringifyError(e, i))
		),
	);
}
