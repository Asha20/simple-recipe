import * as path from "path";
import { Command } from "commander";
import { availableVersions, validTarget } from "./items";
import { config } from "./config";
import { migrate } from "./migrate";
import { compile, watch } from "./compile";

function resolve(file: string) {
	return path.resolve(process.cwd(), file);
}

function main() {
	const program = new Command();
	program
		.command("compile <source> <destination>")
		.option("-t, --target <version>", "Minecraft version", "1.16")
		.description("Compiles the datapack.")
		.action((source: string, destination: string, opts: { target: string }) => {
			if (!validTarget(opts.target)) {
				console.log("Invalid target supplied. The following are supported:", availableVersions.join(", "));
				return;
			}
			config.target = opts.target;
			compile(resolve(source), resolve(destination));
		});

	program
		.command("watch <source> <destination>")
		.option("-t, --target <version>", "Minecraft version", "1.16")
		.description("Compiles the datapack and watches for changes.")
		.action((source: string, destination: string, opts: { target: string }) => {
			if (!validTarget(opts.target)) {
				console.log("Invalid target supplied. The following are supported:", availableVersions.join(", "));
				return;
			}
			config.target = opts.target;
			watch(resolve(source), resolve(destination));
		});

	program
		.command("migrate <source> <destination>")
		.description("Convert a vanilla datapack to the simple-recipe format")
		.action((source: string, destination: string) => {
			migrate(resolve(source), resolve(destination));
		});

	program.parse(process.argv);
}

if (!module.parent) {
	main();
}
