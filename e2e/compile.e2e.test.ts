import * as fs from "fs";
import * as path from "path";
import * as rimraf from "rimraf";
import { main } from "../src/main";

beforeAll(() => {
	process.chdir(__dirname);
});

afterAll(done => {
	rimraf("output", done);
});

test("compile", async () => {
	main("compile yaml output --silent");

	const stat = await fs.promises.stat("output");
	expect(stat.isDirectory).toBeTruthy();

	const expectedContent = await fs.promises.readdir("json");
	const outputContent = await fs.promises.readdir("output");

	expect(expectedContent).toEqual(outputContent);

	for (const file of expectedContent) {
		const expectedPath = path.join("json", file);
		const outputPath = path.join("output", file);
		const expected = require("./" + expectedPath);
		const output = require("./" + outputPath);
		expect(output).toEqual(expected);
	}
});
