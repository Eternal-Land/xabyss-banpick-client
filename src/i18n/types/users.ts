import type { usersLocaleKeys } from "@/i18n/keys";

export type UsersLocaleKeyType =
	(typeof usersLocaleKeys)[keyof typeof usersLocaleKeys];
export type UsersLocaleObject = {
	[key in UsersLocaleKeyType]: string;
};
