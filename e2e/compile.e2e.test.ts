import * as fs from "fs";
import * as path from "path";
import { main } from "../src/main";
import { e2eTestSetup } from "./setup";

const OUTPUT = e2eTestSetup();

test("compile", async () => {
	main(`compile yaml ${OUTPUT} --silent`);

	const stat = await fs.promises.stat(OUTPUT);
	expect(stat.isDirectory).toBeTruthy();

	const expectedContent = await fs.promises.readdir("json");
	const outputContent = await fs.promises.readdir(OUTPUT);

	expect(expectedContent).toEqual(outputContent);

	for (const file of expectedContent) {
		const expectedPath = path.join("json", file);
		const outputPath = path.join(OUTPUT, file);
		const expected = require("./" + expectedPath);
		const output = require("./" + outputPath);
		expect(output).toEqual(expected);
	}
});
