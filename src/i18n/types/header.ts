import type { headerLocaleKeys } from "@/i18n/keys";

export type HeaderLocaleKeyType =
	(typeof headerLocaleKeys)[keyof typeof headerLocaleKeys];
export type HeaderLocaleObject = {
	[key in HeaderLocaleKeyType]: string;
};
