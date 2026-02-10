import type { profileLocaleKeys } from "@/i18n/keys";

export type ProfileLocaleKeyType =
	(typeof profileLocaleKeys)[keyof typeof profileLocaleKeys];
export type ProfileLocaleObject = {
	[key in ProfileLocaleKeyType]: string;
};
