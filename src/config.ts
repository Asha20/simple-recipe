import { Target } from "./items";

interface Config {
	target: Target;
	silent: boolean;
}

export const config: Config = {
	target: "1.16",
	silent: false,
};
