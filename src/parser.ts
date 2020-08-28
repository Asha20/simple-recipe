import * as fs from "fs";
import * as yaml from "js-yaml";
import { left, Either, mapLeft } from "fp-ts/Either";
import { map as mapArray } from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import { Errors } from "io-ts";
import { Recipe } from "./recipes";

type ParsedRecipes = Array<Either<string | Errors, Recipe>>;

function parseYAML(yamlContent: string): ParsedRecipes {
	try {
		const x = yaml.safeLoad(yamlContent);
		if (!Array.isArray(x)) {
			return [left("Expected an array of recipes.")];
		}

		if (x.length === 0) {
			return [left("Expected at least one recipe.")];
		}

		return x.map(Recipe.decode);
	} catch (e) {
		return [left("Could not parse YAML.")];
	}
}

function stringifyError(errors: string | Errors) {
	if (typeof errors === "string") {
		return errors;
	}

	let message = "root";
	const context = errors[0].context;
	for (const ctx of context) {
		if (ctx.key) {
			message += Number.isNaN(+ctx.key) ? "." + ctx.key : "[" + ctx.key + "]";
		}
	}

	const lastContext = context[context.length - 1];

	console.log(context);
	if (errors[0].message) {
		return message + ": " + errors[0].message;
	}
	return `${message}: Expected ${lastContext.type.name}, got "${lastContext.actual}"`;
}

// prettier-ignore
export function parseRecipes(filename: string) {
	return pipe(
		fs.readFileSync(filename, "utf8"),
		parseYAML,
		mapArray(mapLeft(stringifyError)),
	);
}
