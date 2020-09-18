import * as fs from "fs";
import * as yaml from "js-yaml";
import { left, Either, either } from "fp-ts/Either";
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

const identifierRegex = /^[a-z_]\w*$/i;

function stringifyError(errors: string | Errors, index: number) {
	let origin = `root[${index}]`;

	if (typeof errors === "string") {
		return origin + ": " + errors;
	}

	const error = errors.find(x => x.message) ?? errors[0];

	const context = error.context;
	for (const ctx of context) {
		if (ctx.key && Number.isNaN(+ctx.key)) {
			origin += identifierRegex.test(ctx.key) ? "." + ctx.key : '["' + ctx.key + '"]';
		}
	}

	const lastContext = context[context.length - 1];

	if (error.message) {
		return origin + ": " + error.message;
	}
	return `${origin}: Expected ${lastContext.type.name}, got "${lastContext.actual}"`;
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
