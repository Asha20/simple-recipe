import { chain, isRight, left, map, right } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { ItemOrTag, Items, items, parseItemOrTag, parseItems, stringifyName } from "../parts";
import { parseArray } from "../parts/common";
import {
	encodeCount,
	encodeGroup,
	err,
	hasKeys,
	isObject,
	leftErr,
	parseType,
	PEither,
	seqS,
	seqT,
	tryParseGroup,
	UnknownObject,
	ValidationError,
} from "../util";
import * as ingredient from "./ingredient";
import { Ingredient } from "./ingredient";

export interface MCCraftingShaped {
	type: "minecraft:crafting_shaped";
	group?: string;
	pattern: string[];
	key: Record<string, Ingredient | Ingredient[]>;
	result: {
		count?: number;
		item: string;
	};
}

type OwnKey = Record<string, ItemOrTag | ItemOrTag[]>;

export interface OwnCraftingShaped {
	type: "crafting_shaped";
	group?: string;
	pattern: string[];
	key: OwnKey;
	result: Items;
}

const arrayOfStrings = (u: unknown): PEither<string[]> =>
	Array.isArray(u) && u.every(x => typeof x === "string") ? right(u) : leftErr("Expected an array of strings.");

const validPatternHeight = (p: string[]): PEither<string[]> =>
	p.length > 0 && p.length <= 3 ? right(p) : leftErr("Pattern height must be 1-3.");

const validPatternWidth = (p: string[]): PEither<string[]> => {
	const columns = p[0]?.length ?? 0;
	if (!p.every(row => row.length === columns)) {
		return leftErr("All rows in pattern must have same length.");
	}

	return columns > 0 && columns <= 3 ? right(p) : leftErr("Pattern width must be 1-3.");
};

function parsePattern(u: unknown): PEither<string[]> {
	return pipe(
		arrayOfStrings(u),
		chain(p => seqT(validPatternHeight(p), validPatternWidth(p))),
		map(([p]) => p),
	);
}

const keyTooLong = (k: UnknownObject): PEither<UnknownObject> => {
	const errors: ValidationError[] = [];
	for (const key of Object.keys(k)) {
		if (key.length !== 1) {
			errors.push(err(`Key doesn't have length of 1: "${key}".`));
		}
	}

	return !errors.length ? right(k) : left(errors as any);
};

const spaceAsKey = (k: UnknownObject): PEither<UnknownObject> =>
	!k.hasOwnProperty(" ") ? right(k) : leftErr("Cannot use space as a key.");

const validKey = (k: UnknownObject): PEither<OwnKey> => {
	const errors: ValidationError[] = [];
	const result: OwnKey = {};
	for (const [key, value] of Object.entries(k)) {
		const itemOrTag = parseItemOrTag(value);
		if (isRight(itemOrTag)) {
			result[key] = itemOrTag.right;
			continue;
		}

		if (!Array.isArray(value)) {
			errors.push(err("Expected an Item, a Tag, or an array of Item or Tag.", [key]));
			errors.push(...itemOrTag.left.map(x => x.prepend(key)));
			continue;
		}

		const parsed = parseArray(value, parseItemOrTag);
		if (isRight(parsed)) {
			result[key] = parsed.right;
		} else {
			errors.push(...parsed.left);
		}
	}

	return !errors.length ? right(result) : left(errors as any);
};

function parseKey(u: unknown): PEither<OwnKey> {
	return pipe(
		isObject(u),
		chain(k => seqT(keyTooLong(k), spaceAsKey(k))),
		chain(([k]) => validKey(k)),
	);
}

function validateKeyAndPattern(key: OwnKey, pattern: string[]): PEither<[OwnKey, string[]]> {
	const errors: ValidationError[] = [];
	const charsInPattern = new Set<string>();

	const chars = new Set(pattern.join(""));

	for (const char of chars) {
		charsInPattern.add(char);
		if (char !== " " && !key.hasOwnProperty(char)) {
			errors.push(err(`Unknown key found in pattern: "${char}".`));
			continue;
		}
	}

	for (const k of Object.keys(key)) {
		if (!charsInPattern.has(k)) {
			errors.push(err(`"${k}" exists in key but not in pattern.`));
		}
	}

	return !errors.length ? right([key, pattern]) : left(errors as any);
}

export function parseCraftingShaped(u: unknown): PEither<OwnCraftingShaped> {
	return pipe(
		isObject(u),
		chain(o => hasKeys(o, "type", "pattern", "key", "result")),
		chain(o =>
			seqS({
				type: parseType(o.type, "crafting_shaped"),
				...tryParseGroup(o),
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
		keyRecord[key] = ingredient.from(x.key[key]);
	}

	return {
		type,
		...encodeGroup(x.group),
		pattern: x.pattern,
		key: keyRecord,
		result: {
			...encodeCount(x.result.count),
			item: stringifyName(x.result, true),
		},
	};
}

export function decodeCraftingShaped(x: MCCraftingShaped): OwnCraftingShaped {
	const ownKey: Record<string, ItemOrTag | ItemOrTag[]> = {};
	for (const [key, value] of Object.entries(x.key)) {
		ownKey[key] = ingredient.toItemOrTags(value);
	}

	return {
		type: "crafting_shaped",
		pattern: x.pattern,
		key: ownKey,
		result: items(x.result.item, x.result.count ?? 1),
	};
}
