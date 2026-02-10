import type { adminLocaleKeys } from "@/i18n/keys";

export type AdminLocaleKeyType =
	(typeof adminLocaleKeys)[keyof typeof adminLocaleKeys];
export type AdminLocaleObject = {
	[key in AdminLocaleKeyType]: string;
};
