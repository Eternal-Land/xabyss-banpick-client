import { http } from "@/lib/http";
import type { BaseApiResponse } from "@/lib/types";
import type { HoyolabSyncInput } from "./types";

async function syncCharacters(input: HoyolabSyncInput) {
	const response = await http.post<BaseApiResponse>(
		"/api/hoyolab/sync-characters",
		input,
	);
	return response.data;
}

export const hoyolabApi = {
	syncCharacters,
} as const;
