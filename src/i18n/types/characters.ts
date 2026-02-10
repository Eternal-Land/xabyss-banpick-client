import type { charactersLocaleKeys } from "@/i18n/keys";

export type CharactersLocaleKeyType =
	(typeof charactersLocaleKeys)[keyof typeof charactersLocaleKeys];
export type CharactersLocaleObject = {
	[key in CharactersLocaleKeyType]: string;
};
