import type { weaponCostsLocaleKeys } from "@/i18n/keys";

export type WeaponCostsLocaleKeyType =
	(typeof weaponCostsLocaleKeys)[keyof typeof weaponCostsLocaleKeys];
export type WeaponCostsLocaleObject = {
	[key in WeaponCostsLocaleKeyType]: string;
};
