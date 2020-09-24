import { config } from "./config";
import { getValidation, Either, right, left, either } from "fp-ts/lib/Either";
import { getSemigroup, NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import { sequenceT, sequenceS } from "fp-ts/lib/Apply";

export type UnknownObject = Record<string, unknown>;

export function log(...args: any[]) {
	if (!config.silent) {
		console.log(...args);
	}
}

export function clearConsole() {
	if (!config.silent) {
		console.clear();
	}
}

export const applicativeValidation = getValidation(getSemigroup<string>());
export const seqT = sequenceT(applicativeValidation);
const _seqS = sequenceS(applicativeValidation);

export const seqS: typeof _seqS = record => {
	const newRecord = {} as any;
	for (const [key, value] of Object.entries(record)) {
		newRecord[key] = either.mapLeft(value, errors =>
			errors.map(err => {
				return `${key}: ${err}`;
			}),
		);
	}
	return _seqS(newRecord) as any;
};
export type TODO = any;

export const expectedString = (u: unknown): Either<NonEmptyArray<string>, string> =>
	typeof u === "string" ? right(u) : left(["Expected a string"]);

export const nonEmpty = (u: string): Either<NonEmptyArray<string>, string> =>
	u.length ? right(u) : left(["String cannot be empty."]);

export const isObject = (u: unknown): Either<NonEmptyArray<string>, UnknownObject> =>
	typeof u === "object" && !!u ? right(u as UnknownObject) : left(["Expected an object."]);

export const hasKeys = <T extends object, K extends string[]>(
	x: T,
	...keys: K
): Either<NonEmptyArray<string>, T & Record<K[number], unknown>> => {
	const errors: string[] = [];
	for (const key of keys) {
		if (!x.hasOwnProperty(key)) {
			errors.push(`Missing key "${key}".`);
		}
	}

	return !errors.length ? right(x as any) : left(errors as NonEmptyArray<string>);
};
