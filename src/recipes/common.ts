import * as assert from "assert";
import { ItemOrTag, Stack, item, tag, items, tags, Item, Tag, Items, Tags, isItem, isTag, ItemsOrTags } from "../parts";

export type ItemIngredient = { item: string };
export type TagIngredient = { tag: string };
export type Ingredient = ItemIngredient | TagIngredient;
export type RecursiveIngredient = Ingredient | RecursiveIngredient[];

export function arrayOf<T>(length: number, value: T) {
	return Array.from({ length }, () => value);
}

export function stringify(itemOrTag: { namespace: string; name: string }) {
	return itemOrTag.namespace + ":" + itemOrTag.name;
}

export function toIngredient(itemOrTag: ItemOrTag): Ingredient {
	if (itemOrTag.type === "item") {
		return itemIng(itemOrTag.name, itemOrTag.namespace);
	}
	return tagIng(itemOrTag.name, itemOrTag.namespace);
}

export function toIngredients(x: ItemOrTag): Ingredient;
export function toIngredients(x: ItemOrTag[]): Ingredient[];
export function toIngredients(x: ItemOrTag | ItemOrTag[]): Ingredient | Ingredient[];
export function toIngredients(x: Stack): RecursiveIngredient;
export function toIngredients(itemOrTags: ItemOrTag | ItemOrTag[] | Stack) {
	const boxed: Array<ItemOrTag | Stack> = Array.isArray(itemOrTags) ? itemOrTags : [itemOrTags];

	const result: RecursiveIngredient[] = [];

	boxed.forEach(x => {
		if (Array.isArray(x)) return result.push(toIngredients(x));
		switch (x.type) {
			case "item":
				return result.push({ item: stringify(x) });
			case "tag":
				return result.push({ tag: stringify(x) });
			case "items":
				return result.push(...arrayOf(x.count, { item: stringify(x) }));
			case "tags":
				return result.push(...arrayOf(x.count, { tag: stringify(x) }));
		}
	});

	return isItem(itemOrTags) || isTag(itemOrTags) ? result[0] : result;
}

export function fromIngredient(ing: ItemIngredient | TagIngredient): ItemOrTag {
	const isItem = typeof (ing as any).item === "string";
	const fullName = isItem ? (ing as any).item : (ing as any).tag;
	const [namespace, name] = fullName.split(":");
	return isItem ? item(name, namespace) : tag(name, namespace);
}

export function fromIngredientsToItemOrTags(ing: RecursiveIngredient): ItemOrTag | ItemOrTag[] {
	if (!Array.isArray(ing)) {
		return fromIngredient(ing);
	}

	return ing.map(x => {
		assert(!Array.isArray(x));
		return fromIngredient(x);
	});
}

export function fromIngredientsToStack(ing: RecursiveIngredient): Stack[] {
	const result: Stack[] = [];
	let currentVal: null | ItemOrTag = null;
	let count = 0;
	ing = Array.isArray(ing) ? ing : [ing];
	for (const i of ing) {
		if (Array.isArray(i)) {
			if (currentVal !== null) {
				const r =
					currentVal.type === "item"
						? items(currentVal.name, count, currentVal.namespace)
						: tags(currentVal.name, count, currentVal.namespace);

				result.push(r);
				currentVal = null;
				count = 0;
			}
			result.push(fromIngredientsToStack(i));
			continue;
		}
		const itemOrTag = fromIngredient(i);
		if (currentVal === null) {
			currentVal = itemOrTag;
			count = 1;
		} else if (
			itemOrTag.type !== currentVal.type ||
			itemOrTag.namespace !== currentVal.namespace ||
			itemOrTag.name !== currentVal.name
		) {
			const r =
				currentVal.type === "item"
					? items(currentVal.name, count, currentVal.namespace)
					: tags(currentVal.name, count, currentVal.namespace);

			result.push(r);
			currentVal = itemOrTag;
			count = 1;
		} else {
			count += 1;
		}
	}

	if (currentVal) {
		const r =
			currentVal.type === "item"
				? items(currentVal.name, count, currentVal.namespace)
				: tags(currentVal.name, count, currentVal.namespace);

		result.push(r);
	}

	return result;
}

export function itemIng(name: string, namespace = "minecraft"): ItemIngredient {
	return { item: stringify({ name, namespace }) };
}

export function tagIng(name: string, namespace = "minecraft"): TagIngredient {
	return { tag: stringify({ name, namespace }) };
}
