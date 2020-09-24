import { some, none, Option, isSome } from "fp-ts/lib/Option";
import { Either, left, right, chain } from "fp-ts/lib/Either";
import { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import { config } from "../config";
import { items, findSuggestions } from "../items";
import { pipe } from "fp-ts/lib/pipeable";
import { sequenceT } from "fp-ts/lib/Apply";
import { applicativeValidation, expectedString, nonEmpty } from "../util";

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

const cannotStartWithPlus = (u: string): Either<NonEmptyArray<string>, string> =>
	!u.startsWith("+") ? right(u) : left(['An Item cannot start with "+".']);

const validFormat = (u: string): Either<NonEmptyArray<string>, Item> => {
	const item = matchItem(u);
	return isSome(item) ? right(item.value) : left(["Invalid Item format was provided."]);
};

function validItemName({ name, namespace }: Item): Either<NonEmptyArray<string>, Item> {
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
		return left([unknownItem]);
	}

	return left([unknownItem + "\n\n" + perhapsYouMeant]);
}

export function parseItem(u: unknown): Either<NonEmptyArray<string>, Item> {
	return pipe(
		expectedString(u),
		chain(s => sequenceT(applicativeValidation)(nonEmpty(s), cannotStartWithPlus(s), validFormat(s))),
		chain(([_, __, item]) => validItemName(item)),
	);
}

export function item(name: string, namespace = "minecraft"): Item {
	if (name.includes(":")) {
		const [namespace, itemName] = name.split(":");
		return { type: "item", name: itemName, namespace };
	}

	return { type: "item", name, namespace };
}
