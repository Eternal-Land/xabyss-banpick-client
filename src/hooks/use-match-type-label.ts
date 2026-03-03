import { matchLocaleKeys } from "@/i18n/keys";
import { getTranslationToken } from "@/i18n/namespaces";
import { MatchType } from "@/lib/constants";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export function useMatchTypeLabel() {
	const { t } = useTranslation();

	return useMemo(
		() => ({
			[MatchType.REALTIME]: t(
				getTranslationToken("match", matchLocaleKeys.match_type_real_time),
			),
			[MatchType.TURN_BASED]: t(
				getTranslationToken("match", matchLocaleKeys.match_type_turn_based),
			),
		}),
		[t],
	);
}

export function useMatchTypeOptions() {
	const labels = useMatchTypeLabel();

	return useMemo(
		() =>
			Object.entries(labels).map(([value, label]) => ({
				label,
				value: Number(value),
			})),
		[labels],
	);
}
