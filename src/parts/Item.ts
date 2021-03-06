import { sequenceT } from "fp-ts/lib/Apply";
import { chain, right } from "fp-ts/lib/Either";
import { isSome, none, Option, some } from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { config } from "../config";
import { findSuggestions, items } from "../items";
import { applicativeValidation, expectedString, leftErr, nonEmpty, PEither } from "../util";
import { stringifyName } from "./common";

export interface Item {
	type: "item";
	namespace: string;
	name: string;
}

const withNamespaceRegex = /^(\w+):(\w+)$/;
const withoutNamespaceRegex = /^(\w+)$/;

function matchItem(x: string): Option<Item> {
	let match = x.match(withNamespaceRegex);
	if (match) {
		return some(item(match[2], match[1]));
	}
	match = x.match(withoutNamespaceRegex);
	if (match) {
		return some(item(match[1]));
	}
	return none;
}

const cannotStartWithPlus = (u: string): PEither<string> =>
	!u.startsWith("+") ? right(u) : leftErr('An Item cannot start with "+".');

const validFormat = (u: string): PEither<Item> => {
	const item = matchItem(u);
	return isSome(item) ? right(item.value) : leftErr("Invalid Item format was provided.");
};

function validItemName({ name, namespace }: Item): PEither<Item> {
	if (!config.spellcheck) {
		return right(item(name, namespace));
	}

	if (namespace !== "minecraft") {
		return right(item(name, namespace));
	}

	if (items[config.target].has(name)) {
		return right(item(name, namespace));
	}

	const suggestions = findSuggestions(config.target, name, 0.6, 3);
	const unknownItem = `Unknown item "${name}".`;
	const suggestionsString = suggestions.map(x => " - " + x).join("\n");
	const perhapsYouMeant = `Perhaps you meant one of the following?\n\n${suggestionsString}`;

	if (suggestions.length === 0) {
		return leftErr(unknownItem);
	}

	return leftErr(unknownItem + "\n\n" + perhapsYouMeant);
}

export function parseItem(u: unknown): PEither<Item> {
	return pipe(
		expectedString(u),
		chain(s => sequenceT(applicativeValidation)(nonEmpty(s), cannotStartWithPlus(s), validFormat(s))),
		chain(([_, __, item]) => validItemName(item)),
	);
}

export function decodeItem(item: Item): string {
	return stringifyName(item);
}

export function isItem(u: unknown): u is Item {
	return typeof u === "object" && !!u && (u as any).type === "item";
}

export function item(name: string, namespace = "minecraft"): Item {
	if (name.includes(":")) {
		const [namespace, itemName] = name.split(":");
		return { type: "item", name: itemName, namespace };
	}

	return { type: "item", name, namespace };
}
