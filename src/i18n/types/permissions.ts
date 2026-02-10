import type { permissionsLocaleKeys } from "@/i18n/keys";

export type PermissionsLocaleKeyType =
	(typeof permissionsLocaleKeys)[keyof typeof permissionsLocaleKeys];
export type PermissionsLocaleObject = {
	[key in PermissionsLocaleKeyType]: string;
};
