import * as os from "os";
import * as path from "path";
import * as rimraf from "rimraf";

export function e2eTestSetup() {
	const folderName = "e2e_" + Math.floor(0xffffff * Math.random());
	const outputFolder = path.join(os.tmpdir(), folderName);

	beforeAll(() => {
		process.chdir(__dirname);
	});

	afterAll(done => {
		rimraf(outputFolder, done);
	});

	return outputFolder;
}
