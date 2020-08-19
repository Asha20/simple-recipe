import * as t from "io-ts";
import { Either, map } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { Item } from "./Item";

export interface ItemStack {
	type: "item_stack";
	count: number;
	name: string;
}

function is(u: unknown): u is ItemStack {
	return (
		typeof u === "object" &&
		!!u &&
		(u as any).type === "item" &&
		typeof (u as any).count === "number" &&
		typeof (u as any).name === "string"
	);
}

function validate(u: unknown, c: t.Context): Either<t.Errors, ItemStack> {
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
		map(item => itemStack(item.name, count)),
	);
}

export const ItemStack = new t.Type<ItemStack, ItemStack, unknown>("ItemStack", is, validate, t.identity);

export function itemStack(name: string, count: number): ItemStack {
	return { type: "item_stack", name, count };
}
