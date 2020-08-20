import * as t from "io-ts";
import { Either, map } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { Tag } from "./Tag";

export interface Tags {
	type: "tags";
	count: number;
	namespace: string;
	name: string;
}

function is(u: unknown): u is Tags {
	return (
		typeof u === "object" &&
		!!u &&
		(u as any).type === "tag" &&
		typeof (u as any).count === "number" &&
		typeof (u as any).name === "string"
	);
}

function validate(u: unknown, c: t.Context): Either<t.Errors, Tags> {
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
		map(tag => tags(tag.name, count, tag.namespace)),
	);
}

export const Tags = new t.Type<Tags, Tags, unknown>("Tags", is, validate, t.identity);

export function tags(name: string, count: number, namespace = "minecraft"): Tags {
	return { type: "tags", count, name, namespace };
}
