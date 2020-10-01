import * as assert from "assert";
import {
	isItem,
	isTag,
	item as createItem,
	ItemOrTag,
	items as createItems,
	Stack,
	stringifyName,
	tag as createTag,
	tags as createTags,
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

export function toStack(ingredients: RecursiveIngredient): Stack[] {
	const result: Stack[] = [];

	const current = {
		val: null as null | ItemOrTag,
		count: 0,
		get() {
			return this.val;
		},
		set(val: ItemOrTag | null) {
			this.val = val;
			this.count = 1;
		},
		add() {
			this.count += 1;
		},
		convert() {
			assert(this.val);
			return this.val.type === "item"
				? createItems(this.val.name, this.count, this.val.namespace)
				: createTags(this.val.name, this.count, this.val.namespace);
		},
		isEqual(itemOrTag: ItemOrTag) {
			return (
				this.val !== null &&
				this.val.type === itemOrTag.type &&
				this.val.namespace === itemOrTag.namespace &&
				this.val.name === itemOrTag.name
			);
		},
	};

	const boxed = Array.isArray(ingredients) ? ingredients : [ingredients];
	for (const ing of boxed) {
		if (Array.isArray(ing)) {
			if (current.get() !== null) {
				result.push(current.convert());
				current.set(null);
			}
			result.push(toStack(ing));
			continue;
		}
		const itemOrTag = toItemOrTag(ing);
		if (current.get() === null) {
			current.set(itemOrTag);
		} else if (!current.isEqual(itemOrTag)) {
			result.push(current.convert());
			current.set(itemOrTag);
		} else {
			current.add();
		}
	}

	if (current.get()) {
		result.push(current.convert());
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
