import { items as items115 } from "./1.15";
import { items as items116 } from "./1.16";

function bigrams(str: string) {
	const result: string[] = [];
	for (let i = 0; i < str.length - 1; i++) {
		result.push(str.charAt(i) + str.charAt(i + 1));
	}
	return result;
}

// Sørensen–Dice coefficient
// https://en.wikipedia.org/wiki/S%C3%B8rensen%E2%80%93Dice_coefficient
function dice(aBigrams: string[], bBigrams: string[]) {
	const bSet = new Set(bBigrams);
	const intersection: string[] = [];
	for (const el of aBigrams) {
		if (bSet.has(el)) {
			intersection.push(el);
		}
	}

	return (2 * intersection.length) / (aBigrams.length + bBigrams.length);
}

export type Target = typeof availableVersions[number];

export const items: Record<Target, Set<string>> = {
	"1.15": items115,
	"1.16": items116,
};

export const availableVersions = ["1.15", "1.16"] as const;

export function findSuggestions(target: Target, needle: string, tolerance: number, max: number) {
	const needleBigrams = bigrams(needle);
	const coefficients = [...items[target]]
		.map(el => ({ term: el, value: dice(bigrams(el), needleBigrams) }))
		.sort((a, b) => b.value - a.value);

	const result: string[] = [];

	for (const { term, value } of coefficients) {
		if (value >= tolerance && result.length < max) {
			result.push(term);
		}
	}

	return result;
}

export function validTarget(target: string): target is Target {
	return availableVersions.includes(target as any);
}
