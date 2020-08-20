import { ItemOrTag, ItemOrTags, Stack } from "../parts";

type ItemIngredient = { item: string };
type TagIngredient = { tag: string };
export type Ingredient = ItemIngredient | TagIngredient | Ingredient[];

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

export function toIngredients(itemOrTags: ItemOrTag | ItemOrTags | Stack): Ingredient[] {
	const boxed: Array<ItemOrTag | Stack> = Array.isArray(itemOrTags) ? itemOrTags : [itemOrTags];

	const result: Ingredient[] = [];

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

	return result;
}

export function itemIng(name: string, namespace = "minecraft"): ItemIngredient {
	return { item: stringify({ name, namespace }) };
}

export function tagIng(name: string, namespace = "minecraft"): TagIngredient {
	return { tag: stringify({ name, namespace }) };
}
