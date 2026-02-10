import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CharacterElement } from "@/lib/constants";
import { charactersLocaleKeys } from "@/i18n/keys";
import { getTranslationToken } from "@/i18n/namespaces";

export function useElementLabel() {
	const { t } = useTranslation();

	return useMemo(
		() => ({
			[CharacterElement.PYRO]: t(
				getTranslationToken(
					"characters",
					charactersLocaleKeys.characters_element_pyro,
				),
			),
			[CharacterElement.HYDRO]: t(
				getTranslationToken(
					"characters",
					charactersLocaleKeys.characters_element_hydro,
				),
			),
			[CharacterElement.ANEMO]: t(
				getTranslationToken(
					"characters",
					charactersLocaleKeys.characters_element_anemo,
				),
			),
			[CharacterElement.ELECTRO]: t(
				getTranslationToken(
					"characters",
					charactersLocaleKeys.characters_element_electro,
				),
			),
			[CharacterElement.DENDRO]: t(
				getTranslationToken(
					"characters",
					charactersLocaleKeys.characters_element_dendro,
				),
			),
			[CharacterElement.CRYO]: t(
				getTranslationToken(
					"characters",
					charactersLocaleKeys.characters_element_cryo,
				),
			),
			[CharacterElement.GEO]: t(
				getTranslationToken(
					"characters",
					charactersLocaleKeys.characters_element_geo,
				),
			),
		}),
		[t],
	);
}

export function useElementOptions() {
	const elementLabels = useElementLabel();

	return useMemo(
		() =>
			Object.entries(elementLabels).map(([value, label]) => ({
				value,
				label,
			})),
		[elementLabels],
	);
}
