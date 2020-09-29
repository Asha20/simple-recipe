import * as chokidar from "chokidar";
import { compile } from "./compile";
import { clearConsole } from "../printer";
import { RecipeFile, Folder, isRecipeFile } from "./common";

export interface WatcherEvent {
	type: "add" | "addDir" | "change" | "unlink" | "unlinkDir";
	path: string;
}

type WatcherEventHandler = (events: WatcherEvent[]) => void;

let batch: WatcherEvent[] = [];
let batchTimeout: NodeJS.Timeout;
const BATCH_INTERVAL = 100;

function batchWatch(paths: string, cwd: string | undefined, handler: WatcherEventHandler) {
	const watcher = chokidar.watch(paths, { cwd });

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

export function watch(input: RecipeFile | Folder, outputDir: string) {
	const paths = isRecipeFile(input) ? input : "**/*.yml";
	return batchWatch(paths, isRecipeFile(input) ? undefined : input, () => {
		clearConsole();
		compile(input, outputDir);
	});
}
