import { Item, parseItem } from "./Item";
import { Tag, parseTag } from "./Tag";
import { isRight, left, Either, right, Right, isLeft, Left } from "fp-ts/lib/Either";
import { NonEmptyArray, of, concat } from "fp-ts/lib/NonEmptyArray";

export type ItemOrTag = Item | Tag;
export type ItemOrTags = ItemOrTag[];

export function parseItemOrTag(u: unknown): Either<NonEmptyArray<string>, ItemOrTag> {
	const item = parseItem(u);
	if (isRight(item)) {
		return item;
	}

	const tag = parseTag(u);
	if (isRight(tag)) {
		return tag;
	}

	const errors = concat(concat(of("Expected an Item or a Tag."), item.left), tag.left);
	return left(errors);
}

export function parseItemOrTags(u: unknown): Either<NonEmptyArray<string>, ItemOrTags> {
	if (!Array.isArray(u)) {
		return left(["Expected an array of Item or Tag."]);
	}

	const parsed = u.map((x, index) => ({ index, result: parseItemOrTag(x) }));

	if (parsed.every(x => isRight(x.result))) {
		return right(parsed.map(x => (x.result as Right<ItemOrTag>).right));
	}

	return left(
		parsed
			.filter((x): x is { index: number; result: Left<NonEmptyArray<string>> } => isLeft(x.result))
			.map(x => `${x.index}: ${x.result.left}`) as NonEmptyArray<string>,
	);
}
