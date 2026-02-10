import type { staffRolesLocaleKeys } from "@/i18n/keys";

export type StaffRolesLocaleKeyType =
	(typeof staffRolesLocaleKeys)[keyof typeof staffRolesLocaleKeys];
export type StaffRolesLocaleObject = {
	[key in StaffRolesLocaleKeyType]: string;
};
