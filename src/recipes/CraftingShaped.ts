import { Items, ItemOrTag, ItemOrTags, parseItems, parseItemOrTag } from "../parts";
import { Ingredient, toIngredients, stringify } from "./common";
import { Either, chain, right, left, map, isRight, Right, Left, isLeft } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { NonEmptyArray, of } from "fp-ts/lib/NonEmptyArray";
import { isObject, hasKeys, seqS, seqT, UnknownObject } from "../util";

export interface MCCraftingShaped {
	type: "minecraft:crafting_shaped";
	pattern: string[];
	key: Record<string, Ingredient>;
	result: {
		count: number;
		item: string;
	};
}

type OwnKey = Record<string, ItemOrTag | ItemOrTags>;

export interface OwnCraftingShaped {
	type: "crafting_shaped";
	pattern: string[];
	key: OwnKey;
	result: Items;
}

const arrayOfStrings = (u: unknown): Either<NonEmptyArray<string>, string[]> =>
	Array.isArray(u) && u.every(x => typeof x === "string") ? right(u) : left(["Expected an array of strings."]);

const validPatternHeight = (p: string[]): Either<NonEmptyArray<string>, string[]> =>
	p.length > 0 && p.length <= 3 ? right(p) : left(["Pattern height must be 1-3."]);

const validPatternWidth = (p: string[]): Either<NonEmptyArray<string>, string[]> => {
	const columns = p[0]?.length ?? 0;
	if (!p.every(row => row.length === columns)) {
		return left(["All rows in pattern must have same length."]);
	}

	return columns > 0 && columns <= 3 ? right(p) : left(["Pattern width must be 1-3."]);
};

function parsePattern(u: unknown): Either<NonEmptyArray<string>, string[]> {
	return pipe(
		arrayOfStrings(u),
		chain(p => seqT(validPatternHeight(p), validPatternWidth(p))),
		map(([p]) => p),
	);
}

const keyTooLong = (k: UnknownObject): Either<NonEmptyArray<string>, UnknownObject> => {
	const errors: string[] = [];
	for (const key of Object.keys(k)) {
		if (key.length !== 1) {
			errors.push(`Key doesn't have length of 1: "${key}".`);
		}
	}

	return !errors.length ? right(k) : left(errors as any);
};

const spaceAsKey = (k: UnknownObject): Either<NonEmptyArray<string>, UnknownObject> =>
	!k.hasOwnProperty(" ") ? right(k) : left(["Cannot use space as a key."]);

const validKey = (k: UnknownObject): Either<NonEmptyArray<string>, OwnKey> => {
	const errors: string[] = [];
	const result: OwnKey = {};
	for (const [key, value] of Object.entries(k)) {
		const itemOrTag = parseItemOrTag(value);
		if (isRight(itemOrTag)) {
			result[key] = itemOrTag.right;
			continue;
		}

		if (!Array.isArray(value)) {
			errors.push(`${key}: Expected an Item, a Tag, or an array of Item or Tag.`);
			continue;
		}

		const parsed = value.map((x, index) => ({ index, result: parseItemOrTag(x) }));

		if (parsed.every(x => isRight(x.result))) {
			result[key] = parsed.map(x => (x.result as Right<ItemOrTag>).right);
			continue;
		}

		errors.push(
			...parsed
				.filter((x): x is { index: number; result: Left<NonEmptyArray<string>> } => isLeft(x.result))
				.map(x => `${x.index}: ${x.result.left}`),
		);
	}

	return !errors.length ? right(result) : left(errors as any);
};

function parseKey(u: unknown): Either<NonEmptyArray<string>, OwnKey> {
	return pipe(
		isObject(u),
		chain(k => seqT(keyTooLong(k), spaceAsKey(k))),
		chain(([k]) => validKey(k)),
	);
}

function validateKeyAndPattern(key: OwnKey, pattern: string[]): Either<NonEmptyArray<string>, [OwnKey, string[]]> {
	const errors: string[] = [];
	const charsInPattern = new Set<string>();

	const chars = new Set(pattern.join(""));

	for (const char of chars) {
		charsInPattern.add(char);
		if (char !== " " && !key.hasOwnProperty(char)) {
			errors.push(`Unknown key found in pattern: "${char}".`);
			continue;
		}
	}

	for (const k of Object.keys(key)) {
		if (!charsInPattern.has(k)) {
			errors.push(`"${key}" exists in key but not in pattern.`);
		}
	}

	return !errors.length ? right([key, pattern]) : left(errors as any);
}

export function parseCraftingShaped(u: unknown): Either<NonEmptyArray<string>, OwnCraftingShaped> {
	return pipe(
		isObject(u),
		chain(o => hasKeys(o, "type", "pattern", "key", "result")),
		chain(o =>
			seqS({
				type: o.type === "crafting_shaped" ? right(o.type) : left(of("Wrong type")),
				pattern: parsePattern(o.pattern),
				key: parseKey(o.key),
				result: parseItems(o.result),
			}),
		),
		chain(x => seqT(right(x), validateKeyAndPattern(x.key, x.pattern))),
		map(([recipe]) => recipe),
	);
}

export function encodeCraftingShaped(x: OwnCraftingShaped): MCCraftingShaped {
	const type = ("minecraft:" + x.type) as MCCraftingShaped["type"];
	const keyRecord: MCCraftingShaped["key"] = {};

	for (const key of Object.keys(x.key)) {
		keyRecord[key] = toIngredients(x.key[key]);
	}

	return {
		type,
		pattern: x.pattern,
		key: keyRecord,
		result: {
			count: x.result.count,
			item: stringify(x.result),
		},
	};
}
