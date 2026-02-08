import { http } from "@/lib/http";
import type {
	CharacterCostCharacterResponse,
	CharacterCostQuery,
	UpdateCharacterCostInput,
} from "./type";
import type { BaseApiResponse } from "@/lib/types";

async function syncCharacterCostsWithCharacters() {
	const response = await http.get<BaseApiResponse>(
		`/api/admin/character-cost/sync`,
	);
	return response.data;
}

async function listCharacterCosts(query: CharacterCostQuery) {
	const params = new URLSearchParams();
	params.append("limit", String(query.limit));
	if (query.showInactive !== undefined) {
		params.append("showInactive", String(query.showInactive));
	}
	if (query.startId !== undefined) {
		params.append("startId", String(query.startId));
	}
	if (query.element !== undefined) {
		query.element.forEach((el) => {
			params.append("element", el.toString());
		});
	}
	if (query.search !== undefined) {
		params.append("search", query.search);
	}
	const response = await http.get<
		BaseApiResponse<CharacterCostCharacterResponse[]>
	>(`/api/admin/character-cost?${params.toString()}`);
	return response.data;
}

async function updateCharacterCost(
	characterCostId: number,
	input: UpdateCharacterCostInput,
) {
	const response = await http.put<
		BaseApiResponse<CharacterCostCharacterResponse>
	>(`/api/admin/character-cost/${characterCostId}`, input);
	return response.data;
}

export const characterCostsApi = {
	syncCharacterCostsWithCharacters,
	listCharacterCosts,
	updateCharacterCost,
} as const;
