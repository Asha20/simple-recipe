import * as t from "io-ts";
import { Either } from "fp-ts/lib/Either";

export interface Item {
	type: "item";
	name: string;
}

const withNamespaceRegex = /^(\w+):(\w+)$/;
const withoutNamespaceRegex = /^(\w+)$/;

function validateItem(u: unknown, c: t.Context, namespace: string, name: string): Either<t.Errors, Item> {
	const namespacedName = namespace + ":" + name;
	const result = t.success<Item>(item(namespacedName));

	if (namespace !== "minecraft") {
		return result;
	}

	if (name !== "apple" && name !== "dirt") {
		return t.failure(u, c, "Unrecognized item.");
	}

	return result;
}

function is(u: unknown): u is Item {
	return typeof u === "object" && !!u && (u as any).type === "item" && typeof (u as any).name === "string";
}

function validate(u: unknown, c: t.Context): Either<t.Errors, Item> {
	if (typeof u !== "string") {
		return t.failure(u, c, "Expected a string");
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

export function item(name: string): Item {
	return { type: "item", name };
}
