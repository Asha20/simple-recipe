#!/usr/bin/env node
import { Command } from "commander";
import { availableVersions, validTarget } from "./items";
import { initConfig, Config } from "./config";
import { migrate, compile, watch } from "./commands";
import { isRecipeFile, doesExist, isFolder } from "./commands/common";

export function main(args: string | string[]) {
	const program = new Command();
	program.version("1.0.0", "--version");

	program
		.command("compile <source> <destination>")
		.option("--silent", "Don't print to console")
		.option("-t, --target <version>", "Minecraft version", "1.16")
		.option("-S, --no-spellcheck", "Turn off item spellcheck")
		.description("Compiles the datapack.")
		.action((source: string, destination: string, opts: Config) => {
			if (!validTarget(opts.target)) {
				console.log("Invalid target supplied. The following are supported:", availableVersions.join(", "));
				return;
			}
			initConfig(opts);

			if (!doesExist(source)) {
				console.log("Provided source does not exist.");
				return;
			}
			if (!isRecipeFile(source) && !isFolder(source)) {
				console.log("You must provide a folder or a .yml file as the source.");
				return;
			}
			compile(source, destination);
		});

	program
		.command("watch <source> <destination>")
		.option("--silent", "Don't print to console")
		.option("-t, --target <version>", "Minecraft version", "1.16")
		.description("Compiles the datapack and watches for changes.")
		.action((source: string, destination: string, opts: Config) => {
			if (!validTarget(opts.target)) {
				console.log("Invalid target supplied. The following are supported:", availableVersions.join(", "));
				return;
			}
			initConfig(opts);

			if (!doesExist(source)) {
				console.log("Provided source does not exist.");
				return;
			}
			if (!isRecipeFile(source) && !isFolder(source)) {
				console.log("You must provide a folder or a .yml file as the source.");
				return;
			}
			watch(source, destination);
		});

	program
		.command("migrate <source> <destination>")
		.option("--silent", "Don't print to console")
		.description("Convert a vanilla datapack to the simple-recipe format")
		.action((source: string, destination: string, opts: Pick<Config, "silent">) => {
			initConfig(opts);

			if (!doesExist(source)) {
				console.log("Provided source does not exist.");
				return;
			}
			if (!isFolder(source)) {
				console.log("You must provide a folder as the source.");
				return;
			}
			migrate(source, destination);
		});

	if (args === process.argv) {
		program.parse(args);
	} else if (typeof args === "string") {
		program.parse(args.split(" "), { from: "user" });
	} else {
		program.parse(args, { from: "user" });
	}
}

if (!module.parent) {
	main(process.argv);
}
