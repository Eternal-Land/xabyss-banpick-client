import type { staffsLocaleKeys } from "@/i18n/keys";

export type StaffsLocaleKeyType =
	(typeof staffsLocaleKeys)[keyof typeof staffsLocaleKeys];
export type StaffsLocaleObject = {
	[key in StaffsLocaleKeyType]: string;
};
