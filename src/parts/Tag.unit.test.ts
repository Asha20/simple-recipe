import { Tag, tag } from "./Tag";

describe("Tag", () => {
	test("decoding", () => {
		expect(Tag.decode(123)).toBeLeft();
		expect(Tag.decode("")).toBeLeft();
		expect(Tag.decode("minecraft:apple")).toBeLeft();
		expect(Tag.decode("+minecraft:foo:bar")).toBeLeft();

		expect(Tag.decode("+breakable")).toBeRight(tag("breakable"));
		expect(Tag.decode("+foo:destroyable")).toBeRight(tag("destroyable", "foo"));
	});
});
