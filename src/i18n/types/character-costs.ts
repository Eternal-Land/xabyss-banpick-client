import type { characterCostsLocaleKeys } from "@/i18n/keys";

export type CharacterCostsLocaleKeyType =
	(typeof characterCostsLocaleKeys)[keyof typeof characterCostsLocaleKeys];
export type CharacterCostsLocaleObject = {
	[key in CharacterCostsLocaleKeyType]: string;
};
