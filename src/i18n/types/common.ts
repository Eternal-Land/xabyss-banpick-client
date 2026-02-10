import type { commonLocaleKeys } from "@/i18n/keys";

export type CommonLocaleKeyType =
	(typeof commonLocaleKeys)[keyof typeof commonLocaleKeys];
export type CommonLocaleObject = {
	[key in CommonLocaleKeyType]: string;
};
