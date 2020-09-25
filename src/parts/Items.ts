import { chain, left, map, right } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { expectedString, nonEmpty, PEither, seqT, err } from "../util";
import { parseItem } from "./Item";
import { stringifyName } from "./common";

export interface Items {
	type: "items";
	count: number;
	namespace: string;
	name: string;
}

const validFormat = (u: string): PEither<[number, string]> => {
	const tokens = u.split(" ");
	if (tokens.length !== 2) {
		return left([err("Expected a number followed by an Item.")]);
	}
	const [count, name] = tokens;
	if (Number.isNaN(+count)) {
		return left([err("Expected a number followed by an Item.")]);
	}
	return right([+count, name]);
};

const validCount = (u: number): PEither<number> =>
	Number.isInteger(u) && u > 0 && u <= 64 ? right(u) : left([err("Item count must be an integer between 1 and 64.")]);

export function parseItems(u: unknown): PEither<Items> {
	return pipe(
		expectedString(u),
		chain(s => seqT(nonEmpty(s), validFormat(s))),
		chain(([_, [count, name]]) => seqT(validCount(count), parseItem(name))),
		map(([count, item]) => items(item.name, count, item.namespace)),
	);
}

export function decodeItems(items: Items): string {
	return `${items.count} ${stringifyName(items)}`;
}

export function isItems(u: unknown): u is Items {
	return typeof u === "object" && !!u && (u as any).type === "items";
}

export function items(name: string, count: number, namespace = "minecraft"): Items {
	if (name.includes(":")) {
		const [namespace, itemName] = name.split(":");
		return { type: "items", count, name: itemName, namespace };
	}

	return { type: "items", count, name, namespace };
}
