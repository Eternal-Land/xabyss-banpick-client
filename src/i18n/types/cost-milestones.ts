import type { costMilestonesLocaleKeys } from "@/i18n/keys";

export type CostMilestonesLocaleKeyType =
	(typeof costMilestonesLocaleKeys)[keyof typeof costMilestonesLocaleKeys];
export type CostMilestonesLocaleObject = {
	[key in CostMilestonesLocaleKeyType]: string;
};
