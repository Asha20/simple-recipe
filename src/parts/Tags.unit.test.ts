import { parseTags, tags } from "./Tags";

describe("Tags", () => {
	test("decoding", () => {
		expect(parseTags(123)).toBeLeft();
		expect(parseTags("")).toBeLeft();
		expect(parseTags("2.5 +edible")).toBeLeft();
		expect(parseTags("-3 +edible")).toBeLeft();
		expect(parseTags("100 +edible")).toBeLeft();
		expect(parseTags("100 +edible +edible")).toBeLeft();
		expect(parseTags("+edible 100")).toBeLeft();
		expect(parseTags("16 apple")).toBeLeft();

		expect(parseTags("1 +edible")).toBeRight(tags("edible", 1));
		expect(parseTags("4 +breakable")).toBeRight(tags("breakable", 4));
		expect(parseTags("16 +foo:destroyable")).toBeRight(tags("destroyable", 16, "foo"));
	});
});
