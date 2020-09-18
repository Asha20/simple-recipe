import * as rimraf from "rimraf";

export function e2eTestSetup() {
	const outputFolder = "temp_" + Math.floor(0xffffff * Math.random());

	beforeAll(() => {
		process.chdir(__dirname);
	});

	afterAll(done => {
		rimraf(outputFolder, done);
	});

	return outputFolder;
}
