import type { matchLocaleKeys } from "@/i18n/keys";

export type MatchLocaleKeyType =
	(typeof matchLocaleKeys)[keyof typeof matchLocaleKeys];
export type MatchLocaleObject = {
	[key in MatchLocaleKeyType]: string;
};
