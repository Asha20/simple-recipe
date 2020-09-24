import { Either, right, left, chain, map } from "fp-ts/lib/Either";
import { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import { Option, some, isSome, none } from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { sequenceT } from "fp-ts/lib/Apply";
import { applicativeValidation, expectedString, nonEmpty } from "../util";

export interface Tag {
	type: "tag";
	namespace: string;
	name: string;
}

const withNamespaceRegex = /^\+(\w+):(\w+)$/;
const withoutNamespaceRegex = /^\+(\w+)$/;

function matchTag(x: string): Option<Tag> {
	let match = x.match(withNamespaceRegex);
	if (match) {
		return some(tag(match[2], match[1]));
	}
	match = x.match(withoutNamespaceRegex);
	if (match) {
		return some(tag(match[1]));
	}
	return none;
}

const cannotStartWithPlus = (u: string): Either<NonEmptyArray<string>, string> =>
	u.startsWith("+") ? right(u) : left(['A Tag must start with "+".']);

const validFormat = (u: string): Either<NonEmptyArray<string>, Tag> => {
	const tag = matchTag(u);
	return isSome(tag) ? right(tag.value) : left(["Invalid Tag format was provided."]);
};

export function parseTag(u: unknown): Either<NonEmptyArray<string>, Tag> {
	return pipe(
		expectedString(u),
		chain(s => sequenceT(applicativeValidation)(nonEmpty(s), cannotStartWithPlus(s), validFormat(s))),
		map(([_, __, tag]) => tag),
	);
}

export function tag(name: string, namespace = "minecraft"): Tag {
	if (name.includes(":")) {
		const [namespace, tagName] = name.split(":");
		return { type: "tag", name: tagName, namespace };
	}

	return { type: "tag", name, namespace };
}
