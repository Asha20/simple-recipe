import { Item, item } from "./Item";

describe("Item", () => {
	test("decoding", () => {
		expect(Item.decode(123)).toBeLeft();
		expect(Item.decode("")).toBeLeft();
		expect(Item.decode("random item that does not exist")).toBeLeft();
		expect(Item.decode("+minecraft:apple")).toBeLeft();
		expect(Item.decode("minecraft:apple:grass")).toBeLeft();

		expect(Item.decode("apple")).toBeRight(item("minecraft:apple"));
		expect(Item.decode("foo:bar")).toBeRight(item("foo:bar"));
	});
});
