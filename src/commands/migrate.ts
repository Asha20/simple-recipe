import * as fs from "fs";
import * as glob from "glob";
import * as yaml from "js-yaml";
import * as mkdirp from "mkdirp";
import * as path from "path";
import { decodeRecipe, MCRecipe } from "../recipes";

export function migrate(inputDir: string, outputDir: string) {
	const groupedByDirname = glob.sync("**/*.json", { cwd: inputDir }).reduce<Map<string, string[]>>((acc, file) => {
		const dirname = path.dirname(file);
		const array = acc.get(dirname) ?? [];
		array.push(file);
		acc.set(dirname, array);
		return acc;
	}, new Map());

	for (const [dirname, files] of groupedByDirname) {
		const recipes = files.map(file => {
			const recipeName = path.basename(file).replace(".json", "");
			const fileContent = fs.readFileSync(path.resolve(inputDir, file), "utf8");
			const json = JSON.parse(fileContent) as MCRecipe;
			return decodeRecipe(recipeName, json);
		});
		mkdirp.sync(path.resolve(outputDir, dirname));
		fs.writeFileSync(path.resolve(outputDir, dirname, "index.yml"), yaml.dump(recipes));
	}
}
