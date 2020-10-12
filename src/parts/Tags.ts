import { chain, map, right } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { expectedString, leftErr, nonEmpty, PEither, seqT } from "../util";
import { stringifyName } from "./common";
import { parseTag } from "./Tag";

export interface Tags {
	type: "tags";
	count: number;
	namespace: string;
	name: string;
}

const validFormat = (u: string): PEither<[number, string]> => {
	const tokens = u.split(" ");
	if (tokens.length !== 2) {
		return leftErr("Expected a number followed by an Item.");
	}
	const [count, name] = tokens;
	if (Number.isNaN(+count)) {
		return leftErr("Expected a number followed by an Item.");
	}
	return right([+count, name]);
};

const validCount = (u: number): PEither<number> =>
	Number.isInteger(u) && u > 0 && u <= 64 ? right(u) : leftErr("Item count must be an integer between 1 and 64.");

export function parseTags(u: unknown): PEither<Tags> {
	return pipe(
		expectedString(u),
		chain(s => seqT(nonEmpty(s), validFormat(s))),
		chain(([_, [count, name]]) => seqT(validCount(count), parseTag(name))),
		map(([count, item]) => tags(item.name, count, item.namespace)),
	);
}

export function decodeTags(tags: Tags): string {
	return `${tags.count} +${stringifyName(tags)}`;
}

export function isTags(u: unknown): u is Tags {
	return typeof u === "object" && !!u && (u as any).type === "tags";
}

export function tags(name: string, count: number, namespace = "minecraft"): Tags {
	if (name.includes(":")) {
		const [namespace, tagName] = name.split(":");
		return { type: "tags", count, name: tagName, namespace };
	}

	return { type: "tags", count, name, namespace };
}
