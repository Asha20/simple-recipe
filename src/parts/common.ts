export function stringifyName(x: { name: string; namespace: string }) {
	const { name, namespace } = x;
	return namespace === "minecraft" ? name : namespace + ":" + name;
}
