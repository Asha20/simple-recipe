import { Items, items } from "./Items";

describe("Items", () => {
	test("decoding", () => {
		expect(Items.decode(123)).toBeLeft();
		expect(Items.decode("")).toBeLeft();
		expect(Items.decode("2.5 apple")).toBeLeft();
		expect(Items.decode("-3 apple")).toBeLeft();
		expect(Items.decode("100 apple")).toBeLeft();
		expect(Items.decode("100 apple apple")).toBeLeft();
		expect(Items.decode("apple 100")).toBeLeft();
		expect(Items.decode("16 +breakable")).toBeLeft();

		expect(Items.decode("1 apple")).toBeRight(items("apple", 1));
		expect(Items.decode("4 dirt")).toBeRight(items("dirt", 4));
		expect(Items.decode("16 foo:bar")).toBeRight(items("bar", 16, "foo"));
	});
});
