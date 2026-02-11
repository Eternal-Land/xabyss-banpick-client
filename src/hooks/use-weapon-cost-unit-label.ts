import { weaponCostsLocaleKeys } from "@/i18n/keys";
import { getTranslationToken } from "@/i18n/namespaces";
import { WeaponCostUnit } from "@/lib/constants";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export function useWeaponCostUnitLabel() {
	const { t } = useTranslation();

	return useMemo(
		() => ({
			[WeaponCostUnit.COST]: t(
				getTranslationToken(
					"weapon-costs",
					weaponCostsLocaleKeys.weapon_costs_unit_cost,
				),
			),
			[WeaponCostUnit.SECONDS]: t(
				getTranslationToken(
					"weapon-costs",
					weaponCostsLocaleKeys.weapon_costs_unit_seconds,
				),
			),
		}),
		[t],
	);
}

export function useWeaponCostUnitOptions() {
	const labels = useWeaponCostUnitLabel();

	return useMemo(
		() =>
			Object.entries(labels).map(([value, label]) => ({
				label,
				value: Number(value),
			})),
		[labels],
	);
}
