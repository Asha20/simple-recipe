import { parseItems, items } from "./Items";

describe("Items", () => {
	test("parsing", () => {
		expect(parseItems(123)).toBeLeft();
		expect(parseItems("")).toBeLeft();
		expect(parseItems("2.5 apple")).toBeLeft();
		expect(parseItems("-3 apple")).toBeLeft();
		expect(parseItems("100 apple")).toBeLeft();
		expect(parseItems("100 apple apple")).toBeLeft();
		expect(parseItems("apple 100")).toBeLeft();
		expect(parseItems("16 +breakable")).toBeLeft();

		expect(parseItems("1 apple")).toBeRight(items("apple", 1));
		expect(parseItems("4 dirt")).toBeRight(items("dirt", 4));
		expect(parseItems("16 foo:bar")).toBeRight(items("bar", 16, "foo"));
	});
});
