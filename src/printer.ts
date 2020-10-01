import * as chalk from "chalk";
import { Duplicate, InvalidRecipe } from "./commands";
import { ValidationError } from "./util";
import { config } from "./config";

export function log(...args: any[]) {
	if (!config.silent) {
		console.log(...args);
	}
}

export function clearConsole() {
	if (!config.silent) {
		console.clear();
	}
}

function stringifyDuplicates(duplicates: Duplicate[]): string {
	if (duplicates.length === 0) {
		return "";
	}

	const result = ["  Name conflicts:\n"];

	for (const dupe of duplicates) {
		const files = [...dupe.files].join(", ");
		result.push(chalk`  - {yellow ${dupe.name}} in files: {yellow ${files}}`);
	}

	return result.join("\n");
}

function stringifyValidFiles(files: string[]): string {
	return files
		.sort()
		.map(file => chalk.green(`  ✓ ${file}`))
		.join("\n");
}

const identifierRegex = /^[a-z_]\w*$/i;

function joinPath(path: string[]) {
	let result = "";
	for (let i = 0; i < path.length; i++) {
		const part = path[i];
		if (Number.isInteger(+part)) {
			result += `[${part}]`;
		} else if (identifierRegex.test(part)) {
			result += i > 0 ? `.${part}` : part;
		} else {
			result += `["${part}"]`;
		}
	}
	return result;
}

function stringifyInvalidRecipes(fails: InvalidRecipe[]): string {
	const groupedByOrigin = fails.reduce<Map<string, ValidationError[][]>>((acc, x) => {
		const array = acc.get(x.origin) ?? [];
		array.push(x.errors);
		acc.set(x.origin, array);
		return acc;
	}, new Map());

	const result: string[] = [];

	for (const [origin, errorGroup] of groupedByOrigin) {
		result.push(chalk.red(`  ✗ ${origin}\n`));
		for (const errors of errorGroup) {
			for (const error of errors) {
				const path = joinPath(error.origin);
				const colon = path.length ? ": " : "";
				result.push(chalk`{cyan ${path}${colon}}${error.message}`);
			}
		}
		result.push("");
	}
	return result.join("\n");
}

export function getCompilationResults(
	validFiles: string[],
	duplicateRecipes: Duplicate[],
	failedRecipes: InvalidRecipe[],
) {
	return [
		stringifyValidFiles(validFiles),
		stringifyDuplicates(duplicateRecipes),
		stringifyInvalidRecipes(failedRecipes),
	]
		.filter(x => x.length)
		.join("\n\n");
}

export function printCompilationResults(
	validFiles: string[],
	duplicateRecipes: Duplicate[],
	failedRecipes: InvalidRecipe[],
) {
	log(getCompilationResults(validFiles, duplicateRecipes, failedRecipes));
}

export function getMigrationResults(validRecipes: string[], invalidRecipes: InvalidRecipe[]) {
	return [stringifyValidFiles(validRecipes), stringifyInvalidRecipes(invalidRecipes)]
		.filter(x => x.length)
		.join("\n\n");
}

export function printMigrationResults(validRecipes: string[], invalidRecipes: InvalidRecipe[]) {
	log(getMigrationResults(validRecipes, invalidRecipes));
}
