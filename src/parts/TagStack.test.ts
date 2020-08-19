import { TagStack, tagStack } from "./TagStack";

describe("TagStack", () => {
	test("decoding", () => {
		expect(TagStack.decode(123)).toBeLeft();
		expect(TagStack.decode("")).toBeLeft();
		expect(TagStack.decode("2.5 +edible")).toBeLeft();
		expect(TagStack.decode("-3 +edible")).toBeLeft();
		expect(TagStack.decode("100 +edible")).toBeLeft();
		expect(TagStack.decode("100 +edible +edible")).toBeLeft();
		expect(TagStack.decode("+edible 100")).toBeLeft();
		expect(TagStack.decode("16 apple")).toBeLeft();

		expect(TagStack.decode("1 +edible")).toBeRight(tagStack("minecraft:edible", 1));
		expect(TagStack.decode("4 +breakable")).toBeRight(tagStack("minecraft:breakable", 4));
		expect(TagStack.decode("16 +foo:destroyable")).toBeRight(tagStack("foo:destroyable", 16));
	});
});
