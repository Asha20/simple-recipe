import * as t from "io-ts";
import { Item } from "./Item";
import { Tag } from "./Tag";

export type ItemOrTag = t.TypeOf<typeof ItemOrTag>;
export type ItemOrTags = t.TypeOf<typeof ItemOrTags>;

export const ItemOrTag = t.union([Item, Tag], "Item | Tag");
export const ItemOrTags = t.array(ItemOrTag, "Array<Item | Tag>");
