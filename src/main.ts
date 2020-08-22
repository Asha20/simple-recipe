import * as path from "path";
import { parseRecipes } from "./parser";

function main() {
	if (process.argv.length !== 3) {
		console.log("Provide an input file.");
		return process.exit();
	}

	const file = path.resolve(process.cwd(), process.argv[2]);
	parseRecipes(file);
}

if (!module.parent) {
	main();
}
