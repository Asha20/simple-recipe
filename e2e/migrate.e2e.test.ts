import * as fs from "fs";
import * as path from "path";
import { main } from "../src/main";
import { e2eTestSetup } from "./setup";

const OUTPUT = e2eTestSetup();

test("migrate", async () => {
	main(`migrate json ${OUTPUT} --silent`);

	const stat = await fs.promises.stat(OUTPUT);
	expect(stat.isDirectory).toBeTruthy();

	const expectedContent = await fs.promises.readdir("yaml");
	const outputContent = await fs.promises.readdir(OUTPUT);

	expect(expectedContent).toEqual(outputContent);

	for (const file of expectedContent) {
		const expectedPath = path.join("yaml", file);
		const outputPath = path.join(OUTPUT, file);
		const expected = await fs.promises.readFile(expectedPath, "utf8");
		const output = await fs.promises.readFile(outputPath, "utf8");
		expect(output).toEqual(expected);
	}
});
