import { Target } from "./items";

export interface Config {
	target: Target;
	silent: boolean;
	spellcheck: boolean;
}

export const config: Config = {
	target: "1.16",
	silent: false,
	spellcheck: true,
};

export function initConfig(newConfig: Partial<Config>) {
	Object.assign(config, newConfig);
}
