import * as path from "path";
import { watch, WatcherEvent } from "./watcher";

function main() {
	if (process.argv.length !== 3) {
		console.error("Enter an input directory.");
		return process.exit(1);
	}

	const inputDir = path.resolve(process.cwd(), process.argv[2]);

	function handleEvent(events: WatcherEvent[]) {
		console.log(events);
	}

	watch(inputDir, handleEvent);
}

if (!module.parent) {
	main();
}
