import { http } from "@/lib/http";
import type { BaseApiResponse } from "@/lib/types";
import type { UserCharacterResponse } from "./types";

async function listCharacters() {
	const response = await http.get<BaseApiResponse<UserCharacterResponse[]>>(
		"/api/user/characters",
	);
	return response.data;
}

export const userCharactersApi = {
	listCharacters,
} as const;
