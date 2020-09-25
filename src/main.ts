import * as path from "path";
import { Command } from "commander";
import { availableVersions, validTarget } from "./items";
import { config } from "./config";
import { migrate, compile, watch } from "./commands";

interface Options {
	target: string;
	silent: boolean;
}

function resolve(file: string) {
	return path.resolve(process.cwd(), file);
}

export function main(args: string | string[]) {
	const program = new Command();

	program
		.command("compile <source> <destination>")
		.option("--silent", "Don't print to console")
		.option("-t, --target <version>", "Minecraft version", "1.16")
		.description("Compiles the datapack.")
		.action((source: string, destination: string, opts: Options) => {
			if (!validTarget(opts.target)) {
				console.log("Invalid target supplied. The following are supported:", availableVersions.join(", "));
				return;
			}
			config.silent = opts.silent;
			config.target = opts.target;
			compile(resolve(source), resolve(destination));
		});

	program
		.command("watch <source> <destination>")
		.option("--silent", "Don't print to console")
		.option("-t, --target <version>", "Minecraft version", "1.16")
		.description("Compiles the datapack and watches for changes.")
		.action((source: string, destination: string, opts: Options) => {
			if (!validTarget(opts.target)) {
				console.log("Invalid target supplied. The following are supported:", availableVersions.join(", "));
				return;
			}
			config.silent = opts.silent;
			config.target = opts.target;
			watch(resolve(source), resolve(destination));
		});

	program
		.command("migrate <source> <destination>")
		.option("--silent", "Don't print to console")
		.description("Convert a vanilla datapack to the simple-recipe format")
		.action((source: string, destination: string, opts: Pick<Options, "silent">) => {
			config.silent = opts.silent;
			migrate(resolve(source), resolve(destination));
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
