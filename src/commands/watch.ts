import * as path from "path";
import * as chokidar from "chokidar";
import { compile } from "./compile";
import { clearConsole } from "../util";

export interface WatcherEvent {
	type: "add" | "addDir" | "change" | "unlink" | "unlinkDir";
	path: string;
}

type WatcherEventHandler = (events: WatcherEvent[]) => void;

let batch: WatcherEvent[] = [];
let batchTimeout: NodeJS.Timeout;
const BATCH_INTERVAL = 100;

function batchWatch(dirname: string, handler: WatcherEventHandler) {
	const watcher = chokidar.watch(path.join(dirname, "**/*.yml"), { cwd: dirname });

	watcher.on("all", (type, path) => {
		batch.push({ type, path });
		clearTimeout(batchTimeout);
		batchTimeout = setTimeout(() => {
			handler(batch);
			batch = [];
		}, BATCH_INTERVAL);
	});

	return watcher;
}

export function watch(inputDir: string, outputDir: string) {
	return batchWatch(inputDir, () => {
		clearConsole();
		compile(inputDir, outputDir);
	});
}
