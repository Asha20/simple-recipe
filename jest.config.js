module.exports = {
	testEnvironment: "node",
	preset: "ts-jest",
	setupFilesAfterEnv: ["./jest.setup.js"],
	roots: ["src", "e2e"],
	globals: {
		"ts-jest": {
			packageJson: "package.json",
		},
	},
};
