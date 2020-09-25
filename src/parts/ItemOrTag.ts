import { isLeft, isRight, left, Left, right, Right } from "fp-ts/lib/Either";
import { concat, NonEmptyArray, of } from "fp-ts/lib/NonEmptyArray";
import { PEither, err, ValidationError } from "../util";
import { Item, parseItem } from "./Item";
import { parseTag, Tag } from "./Tag";

export type ItemOrTag = Item | Tag;
export type ItemOrTags = ItemOrTag[];

export function parseItemOrTag(u: unknown): PEither<ItemOrTag> {
	const item = parseItem(u);
	if (isRight(item)) {
		return item;
	}

	const tag = parseTag(u);
	if (isRight(tag)) {
		return tag;
	}

	const errors = concat(concat(of(err("Expected an Item or a Tag.")), item.left), tag.left);
	return left(errors);
}

export function parseItemOrTags(u: unknown): PEither<ItemOrTags> {
	if (!Array.isArray(u)) {
		return left([err("Expected an array of Item or Tag.")]);
	}

	const parsed = u.map((x, index) => ({ index, result: parseItemOrTag(x) }));

	if (parsed.every(x => isRight(x.result))) {
		return right(parsed.map(x => (x.result as Right<ItemOrTag>).right));
	}

	return left(
		parsed
			.filter((x): x is { index: number; result: Left<NonEmptyArray<ValidationError>> } => isLeft(x.result))
			.flatMap(x => x.result.left.map(y => err(y.message, [x.index.toString(), ...y.origin]))) as NonEmptyArray<
			ValidationError
		>,
	);
}
