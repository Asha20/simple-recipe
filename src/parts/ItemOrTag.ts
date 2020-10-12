import { isRight } from "fp-ts/lib/Either";
import { leftErr, PEither } from "../util";
import { Item, parseItem } from "./Item";
import { parseTag, Tag } from "./Tag";

export type ItemOrTag = Item | Tag;

export function parseItemOrTag(u: unknown): PEither<ItemOrTag> {
	const item = parseItem(u);
	if (isRight(item)) {
		return item;
	}

	const tag = parseTag(u);
	if (isRight(tag)) {
		return tag;
	}

	if (typeof u === "string") {
		return u.startsWith("+") ? tag : item;
	}

	return leftErr("Expected an Item or a Tag.");
}
