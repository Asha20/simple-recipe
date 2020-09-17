import * as t from "io-ts";
import { Either, map } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { Item } from "./Item";

export interface Items {
	type: "items";
	count: number;
	namespace: string;
	name: string;
}

function is(u: unknown): u is Items {
	return (
		typeof u === "object" &&
		!!u &&
		(u as any).type === "items" &&
		typeof (u as any).count === "number" &&
		typeof (u as any).namespace === "string" &&
		typeof (u as any).name === "string"
	);
}

function validate(u: unknown, c: t.Context): Either<t.Errors, Items> {
	if (typeof u !== "string") {
		return t.failure(u, c, "Expected a string.");
	}

	if (u === "") {
		return t.failure(u, c, "String cannot be empty.");
	}

	const tokens = u.split(" ");
	if (tokens.length !== 2) {
		return t.failure(u, c, "Expected a number followed by an Item.");
	}

	const count = Number(tokens[0]);
	if (!Number.isInteger(count) || count <= 0 || count > 64) {
		return t.failure(u, c, "Item count must be an integer between 1 and 64.");
	}

	return pipe(
		Item.validate(tokens[1], c),
		map(item => items(item.name, count, item.namespace)),
	);
}

export const Items = new t.Type<Items, Items, unknown>("Items", is, validate, t.identity);

export function items(name: string, count: number, namespace = "minecraft"): Items {
	if (name.includes(":")) {
		const [namespace, itemName] = name.split(":");
		return { type: "items", count, name: itemName, namespace };
	}

	return { type: "items", count, name, namespace };
}
