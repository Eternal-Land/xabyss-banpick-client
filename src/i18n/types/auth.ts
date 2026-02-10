import type { authLocaleKeys } from "@/i18n/keys";

export type AuthLocaleKeyType =
	(typeof authLocaleKeys)[keyof typeof authLocaleKeys];
export type AuthLocaleObject = {
	[key in AuthLocaleKeyType]: string;
};
