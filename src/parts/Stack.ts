import { isLeft, isRight, left, Left, right, Right } from "fp-ts/lib/Either";
import { concat, NonEmptyArray, of } from "fp-ts/lib/NonEmptyArray";
import { PEither, err, ValidationError } from "../util";
import { Items, parseItems } from "./Items";
import { parseTags, Tags } from "./Tags";

export type ItemsOrTags = Items | Tags;
export type Stack = Items | Tags | Stack[];

export function parseItemsOrTags(u: unknown): PEither<ItemsOrTags> {
	const items = parseItems(u);
	if (isRight(items)) {
		return items;
	}

	const tags = parseTags(u);
	if (isRight(tags)) {
		return tags;
	}

	// TODO: Predictive error display
	const errors = concat(concat(of(err("Expected an ItemStack or a TagStack.")), items.left), tags.left);
	return left(errors);
}

export function parseStack(u: unknown): PEither<Stack> {
	const itemsOrTags = parseItemsOrTags(u);
	if (isRight(itemsOrTags)) {
		return itemsOrTags;
	}

	if (!Array.isArray(u)) {
		return left([err("Expected an ItemStack, a TagStack or an array of ItemStack or TagStack.")]);
	}

	const parsed = u.map((x, index) => ({ index, result: parseStack(x) }));

	if (parsed.every(x => isRight(x.result))) {
		return right(parsed.map(x => (x.result as Right<ItemsOrTags>).right));
	}

	return left(
		parsed
			.filter((x): x is { index: number; result: Left<NonEmptyArray<ValidationError>> } => isLeft(x.result))
			.flatMap(x => x.result.left.map(y => err(y.message, [x.index.toString(), ...y.origin]))) as NonEmptyArray<
			ValidationError
		>,
	);
}
