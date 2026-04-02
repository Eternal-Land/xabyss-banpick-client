import { http } from "@/lib/http";
import type { BaseApiResponse } from "@/lib/types";
import type {
	CharacterLevelCostQuery,
	CharacterLevelCostResponse,
	CreateCharacterLevelCostInput,
	UpdateCharacterLevelCostInput,
} from "./types";

async function listCharacterLevelCosts(query: CharacterLevelCostQuery) {
	const queryParams = new URLSearchParams();
	queryParams.append("page", query.page.toString());
	queryParams.append("take", query.take.toString());
	if (query.search) {
		queryParams.append("search", query.search);
	}
	if (query.level && query.level.length > 0) {
		query.level.forEach((item) => {
			queryParams.append("level", item.toString());
		});
	}

	const response = await http.get<
		BaseApiResponse<CharacterLevelCostResponse[]>
	>(`/api/admin/character-level-costs?${queryParams.toString()}`);
	return response.data;
}

async function createCharacterLevelCost(input: CreateCharacterLevelCostInput) {
	const response = await http.post<BaseApiResponse<CharacterLevelCostResponse>>(
		"/api/admin/character-level-costs",
		input,
	);
	return response.data;
}

async function updateCharacterLevelCost(
	id: number,
	input: UpdateCharacterLevelCostInput,
) {
	const response = await http.put<BaseApiResponse<CharacterLevelCostResponse>>(
		`/api/admin/character-level-costs/${id}`,
		input,
	);
	return response.data;
}

async function deleteCharacterLevelCost(id: number) {
	const response = await http.delete<
		BaseApiResponse<CharacterLevelCostResponse>
	>(`/api/admin/character-level-costs/${id}`);
	return response.data;
}

export const characterLevelCostsApi = {
	listCharacterLevelCosts,
	createCharacterLevelCost,
	updateCharacterLevelCost,
	deleteCharacterLevelCost,
} as const;
