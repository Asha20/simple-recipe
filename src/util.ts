import { sequenceS, sequenceT } from "fp-ts/lib/Apply";
import { Either, either, getValidation, left, right } from "fp-ts/lib/Either";
import { getSemigroup, NonEmptyArray, of } from "fp-ts/lib/NonEmptyArray";

export type UnknownObject = Record<string, unknown>;
export type PEither<T> = Either<NonEmptyArray<ValidationError>, T>;

class ValidationError {
	constructor(public message: string, public origin: string[]) {}

	prepend(origin: string | number) {
		this.origin.unshift(origin.toString());
		return this;
	}
}

export type { ValidationError };

export function err(message: string, origin: string[] = []): ValidationError {
	return new ValidationError(message, origin);
}

export const applicativeValidation = getValidation(getSemigroup<ValidationError>());
export const seqT = sequenceT(applicativeValidation);
const _seqS = sequenceS(applicativeValidation);

export const seqS: typeof _seqS = record => {
	const newRecord = {} as any;
	for (const [key, value] of Object.entries(record)) {
		newRecord[key] = either.mapLeft(value, errors => errors.map(x => err(x.message, [key, ...x.origin])));
	}
	return _seqS(newRecord) as any;
};
export type TODO = any;

export const expectedString = (u: unknown): PEither<string> =>
	typeof u === "string" ? right(u) : left([err("Expected a string")]);

export const nonEmpty = (u: string): PEither<string> => (u.length ? right(u) : left([err("String cannot be empty.")]));

export const isObject = (u: unknown): PEither<UnknownObject> =>
	typeof u === "object" && !!u ? right(u as UnknownObject) : left([err("Expected an object.")]);

export const hasKeys = <T extends object, K extends string[]>(
	x: T,
	...keys: K
): PEither<T & Record<K[number], unknown>> => {
	const errors: ValidationError[] = [];
	for (const key of keys) {
		if (!x.hasOwnProperty(key)) {
			errors.push(err(`Missing key "${key}".`));
		}
	}

	return !errors.length ? right(x as any) : left(errors as NonEmptyArray<ValidationError>);
};

export function traverse<T>(obj: T, fn: (value: any) => any): T {
	for (const [key, value] of Object.entries(obj)) {
		if (typeof value === "object" && value !== null) {
			traverse(value, fn);
		}
		(obj as any)[key] = fn(value);
	}
	return obj;
}

export function tryParseGroup(o: UnknownObject): {} | { group: PEither<string> } {
	if (!o.hasOwnProperty("group")) {
		return {};
	}

	return typeof o.group === "string" && o.group.length
		? { group: right(o.group) }
		: { group: left(of(err("Group must be a non-empty string."))) };
}

export function encodeGroup(group?: string): {} | { group: string } {
	return group ? { group } : {};
}

export function encodeCount(count: number): {} | { count: number } {
	return count !== 1 ? { count } : {};
}
