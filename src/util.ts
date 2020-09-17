import { config } from "./config";

export function log(...args: any[]) {
	if (!config.silent) {
		console.log(...args);
	}
}

export function clearConsole() {
	if (!config.silent) {
		console.clear();
	}
}
