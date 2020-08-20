import * as t from "io-ts";
import { Items } from "./Items";
import { Tags } from "./Tags";

export type Stack = Items | Tags | Stack[];

export const Stack: t.Type<Stack> = t.recursion("Stack", () => t.union([Items, Tags, t.array(Stack)]));
