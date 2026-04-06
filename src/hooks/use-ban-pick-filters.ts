import { ELEMENT_FILTER_ALL } from "@/components/match/ban-pick-element-filter";
import { RARITY_FILTER_ALL } from "@/components/match/ban-pick-rarity-filter";
import { useState } from "react";

export function useBanPickFilters() {
	const [leftSearch, setLeftSearch] = useState("");
	const [rightSearch, setRightSearch] = useState("");
	const [leftElementFilter, setLeftElementFilter] =
		useState(ELEMENT_FILTER_ALL);
	const [leftRarityFilter, setLeftRarityFilter] = useState(RARITY_FILTER_ALL);
	const [rightElementFilter, setRightElementFilter] =
		useState(ELEMENT_FILTER_ALL);
	const [rightRarityFilter, setRightRarityFilter] = useState(RARITY_FILTER_ALL);

	return {
		leftSearch,
		setLeftSearch,
		rightSearch,
		setRightSearch,
		leftElementFilter,
		setLeftElementFilter,
		leftRarityFilter,
		setLeftRarityFilter,
		rightElementFilter,
		setRightElementFilter,
		rightRarityFilter,
		setRightRarityFilter,
	};
}
