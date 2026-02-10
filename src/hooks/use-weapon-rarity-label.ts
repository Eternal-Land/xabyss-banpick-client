import { WeaponRarity } from "@/lib/constants";
import { weaponsLocaleKeys } from "@/i18n/keys";
import { getTranslationToken } from "@/i18n/namespaces";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export function useWeaponRarityLabel() {
	const { t } = useTranslation();

	return useMemo(
		() => ({
			[WeaponRarity.WEAPON_SS]: t(
				getTranslationToken("weapons", weaponsLocaleKeys.weapons_rarity_ss),
			),
			[WeaponRarity.WEAPON_S]: t(
				getTranslationToken("weapons", weaponsLocaleKeys.weapons_rarity_s),
			),
			[WeaponRarity.WEAPON_NORMAL]: t(
				getTranslationToken("weapons", weaponsLocaleKeys.weapons_rarity_normal),
			),
		}),
		[t],
	);
}

export function useWeaponRarityOptions() {
	const weaponRarityLabels = useWeaponRarityLabel();
	return useMemo(
		() =>
			Object.entries(weaponRarityLabels).map(([value, label]) => ({
				value,
				label,
			})),
		[weaponRarityLabels],
	);
}
