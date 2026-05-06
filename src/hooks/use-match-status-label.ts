import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { matchLocaleKeys } from "@/i18n/keys";
import { getTranslationToken } from "@/i18n/namespaces";
import { MatchStatus } from "@/lib/constants";

export function useMatchStatusLabel() {
	const { t } = useTranslation();

	return useMemo(() => {
		const labels: Record<number, string> = {};
		labels[MatchStatus.WAITING] = t(
			getTranslationToken("match", matchLocaleKeys.match_status_waiting),
		);
		labels[MatchStatus.LIVE] = t(
			getTranslationToken("match", matchLocaleKeys.match_status_live),
		);
		labels[MatchStatus.COMPLETED] = t(
			getTranslationToken("match", matchLocaleKeys.match_status_completed),
		);
		labels[MatchStatus.CANCELED] = t(
			getTranslationToken("match", matchLocaleKeys.match_status_canceled),
		);
		labels[MatchStatus.DELETED] = t(
			getTranslationToken("match", matchLocaleKeys.match_status_deleted),
		);
		return labels;
	}, [t]);
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
