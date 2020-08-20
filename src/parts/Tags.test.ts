import { Tags, tags } from "./Tags";

describe("Tags", () => {
	test("decoding", () => {
		expect(Tags.decode(123)).toBeLeft();
		expect(Tags.decode("")).toBeLeft();
		expect(Tags.decode("2.5 +edible")).toBeLeft();
		expect(Tags.decode("-3 +edible")).toBeLeft();
		expect(Tags.decode("100 +edible")).toBeLeft();
		expect(Tags.decode("100 +edible +edible")).toBeLeft();
		expect(Tags.decode("+edible 100")).toBeLeft();
		expect(Tags.decode("16 apple")).toBeLeft();

		expect(Tags.decode("1 +edible")).toBeRight(tags("edible", 1));
		expect(Tags.decode("4 +breakable")).toBeRight(tags("breakable", 4));
		expect(Tags.decode("16 +foo:destroyable")).toBeRight(tags("destroyable", 16, "foo"));
	});
});
