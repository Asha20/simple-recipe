import { chain, Either, isLeft, isRight, left, right } from "fp-ts/lib/Either";
import { NonEmptyArray, nonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import { pipe } from "fp-ts/lib/pipeable";
import * as fs from "fs";
import * as yaml from "js-yaml";
import { parseRecipe, Recipe } from "./recipes";
import { err, hasKeys, isObject, PEither, ValidationError } from "./util";

function addName(errors: NonEmptyArray<ValidationError>, name: string): NonEmptyArray<ValidationError> {
	return nonEmptyArray.map(errors, x => x.prepend(name).prepend("root"));
}

function addRoot(errors: NonEmptyArray<ValidationError>, index: number): NonEmptyArray<ValidationError> {
	return nonEmptyArray.map(errors, x => x.prepend(index).prepend("root"));
}

function parseName(u: unknown): Either<any, string> {
	return pipe(
		isObject(u),
		chain(o => hasKeys(o, "_name")),
		chain(o => (typeof o._name === "string" && o._name.length ? right(o._name) : left(null))),
	);
}

function parseRecipes(xs: unknown[]): PEither<Recipe>[] {
	return xs.map((x, index) => {
		const r = parseRecipe(x);
		if (isLeft(r)) {
			const name = parseName(x);
			if (isRight(name)) {
				return left(addName(r.left, name.right));
			} else {
				return left(addRoot(r.left, index));
			}
		}

		return r;
	});
}

function parseYAML(yamlContent: string): Array<PEither<Recipe>> {
	try {
		const x = yaml.safeLoad(yamlContent);
		const boxed = Array.isArray(x) ? x : [x];

		if (boxed.length === 0) {
			return [left([err("Expected at least one recipe.")])];
		}

		return parseRecipes(boxed);
	} catch (e) {
		return [left([err("Could not parse YAML.")])];
	}
}

export function readAndParseRecipes(filename: string) {
	return pipe(fs.readFileSync(filename, "utf8"), parseYAML);
}
