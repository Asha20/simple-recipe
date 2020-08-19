import * as t from "io-ts";
import { Either, map } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { Tag } from "./Tag";

export interface TagStack {
	type: "tag_stack";
	count: number;
	name: string;
}

function is(u: unknown): u is TagStack {
	return (
		typeof u === "object" &&
		!!u &&
		(u as any).type === "tag" &&
		typeof (u as any).count === "number" &&
		typeof (u as any).name === "string"
	);
}

function validate(u: unknown, c: t.Context): Either<t.Errors, TagStack> {
	if (typeof u !== "string") {
		return t.failure(u, c, "Expected a string.");
	}

	if (u === "") {
		return t.failure(u, c, "String cannot be empty.");
	}

	const tokens = u.split(" ");
	if (tokens.length !== 2) {
		return t.failure(u, c, "Expected a number followed by a Tag.");
	}

	const count = Number(tokens[0]);
	if (!Number.isInteger(count) || count <= 0 || count > 64) {
		return t.failure(u, c, "Tag count must be an integer between 1 and 64.");
	}

	return pipe(
		Tag.validate(tokens[1], c),
		map(tag => tagStack(tag.name, count)),
	);
}

export const TagStack = new t.Type<TagStack, TagStack, unknown>("TagStack", is, validate, t.identity);

export function tagStack(name: string, count: number): TagStack {
	return { type: "tag_stack", name, count };
}
