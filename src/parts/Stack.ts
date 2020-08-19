import * as t from "io-ts";
import { ItemStack } from "./ItemStack";
import { TagStack } from "./TagStack";

export type Stack = ItemStack | TagStack | Stack[];

export const Stack: t.Type<Stack> = t.recursion("Stack", () =>
  t.union([ItemStack, TagStack, t.array(Stack)]),
);
