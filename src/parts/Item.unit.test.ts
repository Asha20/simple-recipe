import { parseItem, item } from "./Item";

describe("Item", () => {
	test("parsing", () => {
		expect(parseItem(123)).toBeLeft();
		expect(parseItem("")).toBeLeft();
		expect(parseItem("random item that does not exist")).toBeLeft();
		expect(parseItem("+minecraft:apple")).toBeLeft();
		expect(parseItem("minecraft:apple:grass")).toBeLeft();

		expect(parseItem("apple")).toBeRight(item("apple"));
		expect(parseItem("foo:bar")).toBeRight(item("bar", "foo"));
	});
});
