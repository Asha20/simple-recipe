import { ItemOrTag, ItemOrTags, Stack } from "../parts";
export type Ingredient = { item: string } | { tag: string } | Ingredient[];

export function arrayOf<T>(length: number, value: T) {
	return Array.from({ length }, () => value);
}

export function toIngredients(itemOrTags: ItemOrTag | ItemOrTags | Stack): Ingredient[] {
	const boxed: Array<ItemOrTag | Stack> = Array.isArray(itemOrTags) ? itemOrTags : [itemOrTags];

	const result: Ingredient[] = [];

	boxed.forEach(x => {
		if (Array.isArray(x)) return result.push(toIngredients(x));
		switch (x.type) {
			case "item":
				return result.push({ item: x.name });
			case "tag":
				return result.push({ tag: x.name });
			case "item_stack":
				return result.push(...arrayOf(x.count, { item: x.name }));
			case "tag_stack":
				return result.push(...arrayOf(x.count, { tag: x.name }));
		}
	});

	return result;
}
