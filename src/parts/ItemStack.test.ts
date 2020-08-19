import { ItemStack, itemStack } from "./ItemStack";

describe("ItemStack", () => {
	test("decoding", () => {
		expect(ItemStack.decode(123)).toBeLeft();
		expect(ItemStack.decode("")).toBeLeft();
		expect(ItemStack.decode("2.5 apple")).toBeLeft();
		expect(ItemStack.decode("-3 apple")).toBeLeft();
		expect(ItemStack.decode("100 apple")).toBeLeft();
		expect(ItemStack.decode("100 apple apple")).toBeLeft();
		expect(ItemStack.decode("apple 100")).toBeLeft();
		expect(ItemStack.decode("16 +breakable")).toBeLeft();

		expect(ItemStack.decode("1 apple")).toBeRight(itemStack("minecraft:apple", 1));
		expect(ItemStack.decode("4 dirt")).toBeRight(itemStack("minecraft:dirt", 4));
		expect(ItemStack.decode("16 foo:bar")).toBeRight(itemStack("foo:bar", 16));
	});
});
