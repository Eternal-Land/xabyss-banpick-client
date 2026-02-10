import type { weaponsLocaleKeys } from "@/i18n/keys";

export type WeaponsLocaleKeyType =
	(typeof weaponsLocaleKeys)[keyof typeof weaponsLocaleKeys];
export type WeaponsLocaleObject = {
	[key in WeaponsLocaleKeyType]: string;
};
