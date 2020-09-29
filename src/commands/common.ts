import * as fs from "fs";

type Brand<T, K extends string> = T & { brands: { [P in K]: true } };

export type Exists = Brand<string, "Exists">;
export type RecipeFile = Exists & Brand<string, "RecipeFile">;
export type Folder = Exists & Brand<string, "Folder">;

export function doesExist<T extends string>(s: T): s is T & Exists {
	return fs.existsSync(s);
}

export function isRecipeFile<T extends Exists>(s: T): s is T & RecipeFile {
	return s.endsWith(".yml") && fs.statSync(s).isFile();
}

export function isFolder<T extends Exists>(s: T): s is T & Folder {
	return fs.statSync(s).isDirectory();
}
