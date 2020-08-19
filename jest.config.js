module.exports = {
	testEnvironment: "node",
	preset: "ts-jest",
	setupFilesAfterEnv: ["./jest.setup.js"],
	roots: ["src"],
	globals: {
		"ts-jest": {
			packageJson: "package.json",
		},
	},
};
