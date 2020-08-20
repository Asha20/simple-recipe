import * as t from "io-ts";
import { Either } from "fp-ts/lib/Either";

export interface Tag {
	type: "tag";
	namespace: string;
	name: string;
}

const withNamespaceRegex = /^(\w+):(\w+)$/;
const withoutNamespaceRegex = /^(\w+)$/;

function validateTag(u: unknown, c: t.Context, namespace: string, name: string): Either<t.Errors, Tag> {
	return t.success<Tag>(tag(name, namespace));
}

function is(u: unknown): u is Tag {
	return typeof u === "object" && !!u && (u as any).type === "tag" && typeof (u as any).name === "string";
}

function validate(u: unknown, c: t.Context): Either<t.Errors, Tag> {
	if (typeof u !== "string") {
		return t.failure(u, c, "Expected a string");
	}

	if (u === "") {
		return t.failure(u, c, "String cannot be empty.");
	}

	if (!u.startsWith("+")) {
		return t.failure(u, c, 'A Tag must start with "+".');
	}

	const s = u.slice(1);

	let match = s.match(withNamespaceRegex);
	if (match) {
		return validateTag(u, c, match[1], match[2]);
	}

	match = s.match(withoutNamespaceRegex);
	if (match) {
		return validateTag(u, c, "minecraft", match[1]);
	}

	return t.failure(u, c, "Invalid Tag format was provided.");
}

export const Tag = new t.Type<Tag, Tag, unknown>("Tag", is, validate, t.identity);

export function tag(name: string, namespace = "minecraft"): Tag {
	return { type: "tag", name, namespace };
}
