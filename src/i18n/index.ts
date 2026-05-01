import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { i18nNamespaces } from "@/i18n/namespaces";
import enCommon from "@/i18n/locales/en/common";
import enAdmin from "@/i18n/locales/en/admin";
import enAuth from "@/i18n/locales/en/auth";
import enCharacterCosts from "@/i18n/locales/en/character-costs";
import enCharacters from "@/i18n/locales/en/characters";
import enCostMilestones from "@/i18n/locales/en/cost-milestones";
import enHeader from "@/i18n/locales/en/header";
import enMatch from "@/i18n/locales/en/match";
import enPermissions from "@/i18n/locales/en/permissions";
import enProfile from "@/i18n/locales/en/profile";
import enStaffRoles from "@/i18n/locales/en/staff-roles";
import enStaffs from "@/i18n/locales/en/staffs";
import enUsers from "@/i18n/locales/en/users";
import enWeapons from "@/i18n/locales/en/weapons";
import viCommon from "@/i18n/locales/vi/common";
import viAdmin from "@/i18n/locales/vi/admin";
import viAuth from "@/i18n/locales/vi/auth";
import viCharacterCosts from "@/i18n/locales/vi/character-costs";
import viCharacters from "@/i18n/locales/vi/characters";
import viCostMilestones from "@/i18n/locales/vi/cost-milestones";
import viHeader from "@/i18n/locales/vi/header";
import viMatch from "@/i18n/locales/vi/match";
import viPermissions from "@/i18n/locales/vi/permissions";
import viProfile from "@/i18n/locales/vi/profile";
import viStaffRoles from "@/i18n/locales/vi/staff-roles";
import viStaffs from "@/i18n/locales/vi/staffs";
import viUsers from "@/i18n/locales/vi/users";
import viWeapons from "@/i18n/locales/vi/weapons";
import weaponCostsVi from "./locales/vi/weapon-costs";
import weaponCostsEn from "./locales/en/weapon-costs";
import characterWeaponsEn from "./locales/en/character-weapons";
import characterWeaponsVi from "./locales/vi/character-weapons";

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		fallbackLng: "en",
		supportedLngs: ["en", "vi"],
		resources: {
			en: {
				common: enCommon,
				admin: enAdmin,
				auth: enAuth,
				"character-costs": enCharacterCosts,
				characters: enCharacters,
				"cost-milestones": enCostMilestones,
				header: enHeader,
				match: enMatch,
				permissions: enPermissions,
				profile: enProfile,
				"staff-roles": enStaffRoles,
				staffs: enStaffs,
				users: enUsers,
				weapons: enWeapons,
				"weapon-costs": weaponCostsEn,
				"character-weapons": characterWeaponsEn,
			},
			vi: {
				common: viCommon,
				admin: viAdmin,
				auth: viAuth,
				"character-costs": viCharacterCosts,
				characters: viCharacters,
				"cost-milestones": viCostMilestones,
				header: viHeader,
				match: viMatch,
				permissions: viPermissions,
				profile: viProfile,
				"staff-roles": viStaffRoles,
				staffs: viStaffs,
				users: viUsers,
				weapons: viWeapons,
				"weapon-costs": weaponCostsVi,
				"character-weapons": characterWeaponsVi,
			},
		},
		ns: i18nNamespaces,
		defaultNS: "common",
		interpolation: {
			escapeValue: false,
		},

		detection: {
			order: ["localStorage", "navigator"],
			caches: ["localStorage"],
		},
	});

export default i18n;
