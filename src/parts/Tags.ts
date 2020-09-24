import { Either, map, right, left, chain } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { parseTag } from "./Tag";
import { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import { seqT, expectedString, nonEmpty } from "../util";

export interface Tags {
	type: "tags";
	count: number;
	namespace: string;
	name: string;
}

const validFormat = (u: string): Either<NonEmptyArray<string>, [number, string]> => {
	const tokens = u.split(" ");
	if (tokens.length !== 2) {
		return left(["Expected a number followed by an Item."]);
	}
	const [count, name] = tokens;
	if (Number.isNaN(+count)) {
		return left(["Expected a number followed by an Item."]);
	}
	return right([+count, name]);
};

const validCount = (u: number): Either<NonEmptyArray<string>, number> =>
	Number.isInteger(u) && u > 0 && u <= 64 ? right(u) : left(["Item count must be an integer between 1 and 64."]);

export function parseTags(u: unknown): Either<NonEmptyArray<string>, Tags> {
	return pipe(
		expectedString(u),
		chain(s => seqT(nonEmpty(s), validFormat(s))),
		chain(([_, [count, name]]) => seqT(validCount(count), parseTag(name))),
		map(([count, item]) => tags(item.name, count, item.namespace)),
	);
}

export function tags(name: string, count: number, namespace = "minecraft"): Tags {
	if (name.includes(":")) {
		const [namespace, tagName] = name.split(":");
		return { type: "tags", count, name: tagName, namespace };
	}

	return { type: "tags", count, name, namespace };
}
