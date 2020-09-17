import * as t from "io-ts";
import { Either } from "fp-ts/lib/Either";
import { config } from "../config";
import { items, findSuggestions } from "../items";

export interface Item {
	type: "item";
	namespace: string;
	name: string;
}

const withNamespaceRegex = /^(\w+):(\w+)$/;
const withoutNamespaceRegex = /^(\w+)$/;

function validateItem(u: unknown, c: t.Context, namespace: string, name: string): Either<t.Errors, Item> {
	if (items[config.target].has(name)) {
		return t.success<Item>(item(name, namespace));
	}

	const suggestions = findSuggestions(config.target, name, 0.6, 3);
	const unknownItem = `Unknown item "${name}".`;
	const suggestionsString = suggestions.map(x => " - " + x).join("\n");
	const perhapsYouMeant = `Perhaps you meant one of the following?\n\n${suggestionsString}`;

	if (suggestions.length === 0) {
		return t.failure(u, c, unknownItem);
	}

	return t.failure(u, c, unknownItem + "\n\n" + perhapsYouMeant);
}

function is(u: unknown): u is Item {
	return (
		typeof u === "object" &&
		!!u &&
		(u as any).type === "item" &&
		typeof (u as any).namespace === "string" &&
		typeof (u as any).name === "string"
	);
}

function validate(u: unknown, c: t.Context): Either<t.Errors, Item> {
	if (typeof u !== "string") {
		return t.failure(u, c, "Expected a string.");
	}

	if (u === "") {
		return t.failure(u, c, "String cannot be empty.");
	}

	if (u.startsWith("+")) {
		return t.failure(u, c, 'An Item cannot start with "+".');
	}

	let match = u.match(withNamespaceRegex);
	if (match) {
		return validateItem(u, c, match[1], match[2]);
	}

	match = u.match(withoutNamespaceRegex);
	if (match) {
		return validateItem(u, c, "minecraft", match[1]);
	}

	return t.failure(u, c, "Invalid Item format was provided.");
}

export const Item = new t.Type<Item, Item, unknown>("Item", is, validate, t.identity);

export function item(name: string, namespace = "minecraft"): Item {
	return { type: "item", name, namespace };
}
