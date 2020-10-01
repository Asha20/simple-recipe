import { isLeft, isRight, left, Left, right, Right } from "fp-ts/lib/Either";
import { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import { PEither, ValidationError } from "../util";

export function stringifyName(x: { name: string; namespace: string }, forceNamespace = false) {
	const { name, namespace } = x;
	return !forceNamespace && namespace === "minecraft" ? name : namespace + ":" + name;
}

export function parseArray<T>(xs: unknown[], parser: (x: unknown) => PEither<T>): PEither<T[]> {
	const parsed = xs.map((x, index) => ({ index, result: parser(x) }));

	if (parsed.every(x => isRight(x.result))) {
		return right(parsed.map(x => (x.result as Right<T>).right));
	}

	return left(
		parsed
			.filter((x): x is { index: number; result: Left<NonEmptyArray<ValidationError>> } => isLeft(x.result))
			.flatMap(x => x.result.left.map(y => y.prepend(x.index))) as NonEmptyArray<ValidationError>,
	);
}
