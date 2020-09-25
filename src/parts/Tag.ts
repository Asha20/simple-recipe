import { sequenceT } from "fp-ts/lib/Apply";
import { chain, left, map, right } from "fp-ts/lib/Either";
import { isSome, none, Option, some } from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { applicativeValidation, expectedString, nonEmpty, PEither, err } from "../util";
import { of } from "fp-ts/lib/NonEmptyArray";
import { stringifyName } from "./common";

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

const cannotStartWithPlus = (u: string): PEither<string> =>
	u.startsWith("+") ? right(u) : left(of(err('A Tag must start with "+".')));

const validFormat = (u: string): PEither<Tag> => {
	const tag = matchTag(u);
	return isSome(tag) ? right(tag.value) : left([err("Invalid Tag format was provided.")]);
};

export function parseTag(u: unknown): PEither<Tag> {
	return pipe(
		expectedString(u),
		chain(s => sequenceT(applicativeValidation)(nonEmpty(s), cannotStartWithPlus(s), validFormat(s))),
		map(([_, __, tag]) => tag),
	);
}

export function decodeTag(tag: Tag): string {
	return "+" + stringifyName(tag);
}

export function isTag(u: unknown): u is Tag {
	return typeof u === "object" && !!u && (u as any).type === "tag";
}

export function tag(name: string, namespace = "minecraft"): Tag {
	if (name.includes(":")) {
		const [namespace, tagName] = name.split(":");
		return { type: "tag", name: tagName, namespace };
	}

	return { type: "tag", name, namespace };
}
