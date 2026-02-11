export const WeaponCostUnit = {
	COST: 0,
	SECONDS: 1,
} as const;

export type WeaponCostUnitEnum =
	(typeof WeaponCostUnit)[keyof typeof WeaponCostUnit];
