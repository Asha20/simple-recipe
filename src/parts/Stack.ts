import { isRight } from "fp-ts/lib/Either";
import { leftErr, PEither } from "../util";
import { parseArray } from "./common";
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

	if (typeof u === "string") {
		const tokens = u.split(" ");
		if (tokens.length === 2) {
			const [count, name] = tokens;
			return name.startsWith("+") ? tags : items;
		}
	}

	return leftErr("Expected an ItemStack or a TagStack.");
}

export function parseStack(u: unknown): PEither<Stack> {
	const itemsOrTags = parseItemsOrTags(u);
	if (isRight(itemsOrTags)) {
		return itemsOrTags;
	}

	if (typeof u === "string" && u.split(" ").length === 2) {
		return itemsOrTags;
	}

	if (!Array.isArray(u)) {
		return leftErr("Expected an ItemStack, a TagStack or an array of ItemStack or TagStack.");
	}

	return parseArray(u, parseStack);
}
