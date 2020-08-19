const { isLeft, isRight } = require("fp-ts/lib/Either");

expect.extend({
	toBeLeft(received, expected) {
		const matcherName = "toBeLeft";
		const options = {
			comment: "deep equality",
			isNot: this.isNot,
			promise: this.promise,
		};

		const { matcherHint, iterableEquality, printExpected, printReceived, printDiffOrStringify, stringify } = this.utils;

		if (!isLeft(received)) {
			return {
				pass: false,
				message: () =>
					matcherHint(matcherName, undefined, undefined, options) +
					"\n\n" +
					`Expected: ${printReceived(received)} to be a Left`,
			};
		}

		if (expected === undefined) {
			return {
				pass: true,
				message: () =>
					matcherHint(matcherName, undefined, undefined, options) +
					"\n\n" +
					`Expected: ${printExpected(expected)} not to be a Left`,
			};
		}

		const pass = this.equals(received.left, expected, [iterableEquality]);

		const message = pass
			? () =>
					matcherHint(matcherName, undefined, undefined, options) +
					"\n\n" +
					`Expected: not ${printExpected(expected)}\n` +
					(stringify(expected) !== stringify(received.left) ? `Received:     ${printReceived(received)}` : "")
			: () =>
					matcherHint(matcherName, undefined, undefined, options) +
					"\n\n" +
					printDiffOrStringify(expected, received.left, "Expected", "Received", this.expand !== false);

		return { message, name: matcherName, pass };
	},

	toBeRight(received, expected) {
		const matcherName = "toBeRight";
		const options = {
			comment: "deep equality",
			isNot: this.isNot,
			promise: this.promise,
		};

		const { matcherHint, iterableEquality, printExpected, printReceived, printDiffOrStringify, stringify } = this.utils;

		if (!isRight(received)) {
			return {
				pass: false,
				message: () =>
					matcherHint(matcherName, undefined, undefined, options) +
					"\n\n" +
					`Expected: ${printReceived(received)} to be a Right`,
			};
		}

		if (expected === undefined) {
			return {
				pass: true,
				message: () =>
					matcherHint(matcherName, undefined, undefined, options) +
					"\n\n" +
					`Expected: ${printExpected(expected)} not to be a Right`,
			};
		}

		const pass = this.equals(received.right, expected, [iterableEquality]);

		const message = pass
			? () =>
					matcherHint(matcherName, undefined, undefined, options) +
					"\n\n" +
					`Expected: not ${printExpected(expected)}\n` +
					(stringify(expected) !== stringify(received.right) ? `Received:     ${printReceived(received)}` : "")
			: () =>
					matcherHint(matcherName, undefined, undefined, options) +
					"\n\n" +
					printDiffOrStringify(expected, received.right, "Expected", "Received", this.expand !== false);

		return { message, name: matcherName, pass };
	},
});
