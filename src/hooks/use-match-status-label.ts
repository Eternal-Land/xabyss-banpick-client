import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { matchLocaleKeys } from "@/i18n/keys";
import { getTranslationToken } from "@/i18n/namespaces";
import { MatchStatus } from "@/lib/constants";

export function useMatchStatusLabel() {
	const { t } = useTranslation();

	return useMemo(
		() => ({
			[MatchStatus.WAITING]: t(
				getTranslationToken("match", matchLocaleKeys.match_status_waiting),
			),
			[MatchStatus.LIVE]: t(
				getTranslationToken("match", matchLocaleKeys.match_status_live),
			),
			[MatchStatus.COMPLETED]: t(
				getTranslationToken("match", matchLocaleKeys.match_status_completed),
			),
			[MatchStatus.CANCELED]: t(
				getTranslationToken("match", matchLocaleKeys.match_status_canceled),
			),
		}),
		[t],
	);
}

export function useMatchStatusOptions() {
	const labels = useMatchStatusLabel();

	return useMemo(
		() =>
			Object.entries(labels).map(([value, label]) => ({
				label,
				value: Number(value),
			})),
		[labels],
	);
}
