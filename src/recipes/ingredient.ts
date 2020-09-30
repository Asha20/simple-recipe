import {
	isItem,
	isTag,
	item as createItem,
	ItemOrTag,
	items as createItems,
	Stack,
	tag as createTag,
	tags as createTags,
	stringifyName,
} from "../parts";

export type ItemIngredient = { item: string };
export type TagIngredient = { tag: string };
export type Ingredient = ItemIngredient | TagIngredient;
export type RecursiveIngredient = Ingredient | RecursiveIngredient[];

function arrayOf<T>(length: number, value: T) {
	return Array.from({ length }, () => value);
}

export function from(x: ItemOrTag): Ingredient;
export function from(x: ItemOrTag[]): Ingredient[];
export function from(x: ItemOrTag | ItemOrTag[]): Ingredient | Ingredient[];
export function from(x: Stack): RecursiveIngredient;
export function from(itemOrTags: ItemOrTag | ItemOrTag[] | Stack) {
	const boxed: Array<ItemOrTag | Stack> = Array.isArray(itemOrTags) ? itemOrTags : [itemOrTags];

	const result: RecursiveIngredient[] = [];

	boxed.forEach(x => {
		if (Array.isArray(x)) return result.push(from(x));
		switch (x.type) {
			case "item":
				return result.push(item(x.name, x.namespace));
			case "tag":
				return result.push(tag(x.name, x.namespace));
			case "items":
				return result.push(...items(x.count, x.name, x.namespace));
			case "tags":
				return result.push(...tags(x.count, x.name, x.namespace));
		}
	});

	return isItem(itemOrTags) || isTag(itemOrTags) ? result[0] : result;
}

export function toItemOrTag(ing: Ingredient): ItemOrTag {
	const fullName = "item" in ing ? ing.item : ing.tag;
	const [namespace, name] = fullName.split(":");
	return "item" in ing ? createItem(name, namespace) : createTag(name, namespace);
}

export function toItemOrTags(ing: Ingredient | Ingredient[]): ItemOrTag | ItemOrTag[] {
	return Array.isArray(ing) ? ing.map(toItemOrTag) : toItemOrTag(ing);
}

export function toStack(ing: RecursiveIngredient): Stack[] {
	const result: Stack[] = [];
	let currentVal: null | ItemOrTag = null;
	let count = 0;
	ing = Array.isArray(ing) ? ing : [ing];
	for (const i of ing) {
		if (Array.isArray(i)) {
			if (currentVal !== null) {
				const r =
					currentVal.type === "item"
						? createItems(currentVal.name, count, currentVal.namespace)
						: createTags(currentVal.name, count, currentVal.namespace);

				result.push(r);
				currentVal = null;
				count = 0;
			}
			result.push(toStack(i));
			continue;
		}
		const itemOrTag = toItemOrTag(i);
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
					? createItems(currentVal.name, count, currentVal.namespace)
					: createTags(currentVal.name, count, currentVal.namespace);

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
				? createItems(currentVal.name, count, currentVal.namespace)
				: createTags(currentVal.name, count, currentVal.namespace);

		result.push(r);
	}

	return result;
}

export function item(name: string, namespace = "minecraft"): ItemIngredient {
	return { item: stringifyName({ name, namespace }, true) };
}

export function items(count: number, name: string, namespace = "minecraft"): ItemIngredient[] {
	return arrayOf(count, item(name, namespace));
}

export function tag(name: string, namespace = "minecraft"): TagIngredient {
	return { tag: stringifyName({ name, namespace }, true) };
}

export function tags(count: number, name: string, namespace = "minecraft"): TagIngredient[] {
	return arrayOf(count, tag(name, namespace));
}
