import { parseTag, tag } from "./Tag";

describe("Tag", () => {
	test("parsing", () => {
		expect(parseTag(123)).toBeLeft();
		expect(parseTag("")).toBeLeft();
		expect(parseTag("minecraft:apple")).toBeLeft();
		expect(parseTag("+minecraft:foo:bar")).toBeLeft();

		expect(parseTag("+breakable")).toBeRight(tag("breakable"));
		expect(parseTag("+foo:destroyable")).toBeRight(tag("destroyable", "foo"));
	});
});
