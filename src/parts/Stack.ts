import { Items, parseItems } from "./Items";
import { Tags, parseTags } from "./Tags";
import { isRight, left, Either, right, Right, Left, isLeft } from "fp-ts/lib/Either";
import { concat, of, NonEmptyArray } from "fp-ts/lib/NonEmptyArray";

type ItemsOrTags = Items | Tags;
export type Stack = Items | Tags | Stack[];

export function parseItemsOrTags(u: unknown): Either<NonEmptyArray<string>, ItemsOrTags> {
	const items = parseItems(u);
	if (isRight(items)) {
		return items;
	}

	const tags = parseTags(u);
	if (isRight(tags)) {
		return tags;
	}

	const errors = concat(concat(of("Expected an ItemStack or a TagStack."), items.left), tags.left);
	return left(errors);
}

export function parseStack(u: unknown): Either<NonEmptyArray<string>, Stack> {
	const itemsOrTags = parseItemsOrTags(u);
	if (isRight(itemsOrTags)) {
		return itemsOrTags;
	}

	if (!Array.isArray(u)) {
		return left(["Expected an ItemStack, a TagStack or an array of ItemStack or TagStack."]);
	}

	const parsed = u.map((x, index) => ({ index, result: parseStack(x) }));

	if (parsed.every(x => isRight(x.result))) {
		return right(parsed.map(x => (x.result as Right<ItemsOrTags>).right));
	}

	return left(
		parsed
			.filter((x): x is { index: number; result: Left<NonEmptyArray<string>> } => isLeft(x.result))
			.map(x => `${x.index}: ${x.result.left}`) as NonEmptyArray<string>,
	);
}
