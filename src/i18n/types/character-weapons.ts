import type { characterWeaponsLocaleKeys } from "@/i18n/keys";

export type CharacterWeaponsLocaleKeyType =
	(typeof characterWeaponsLocaleKeys)[keyof typeof characterWeaponsLocaleKeys];

export type CharacterWeaponsLocaleObject = {
	[key in CharacterWeaponsLocaleKeyType]: string;
};
