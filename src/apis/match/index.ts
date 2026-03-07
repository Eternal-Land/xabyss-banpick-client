import { http } from "@/lib/http";
import type {
	CreateMatchInput,
	ListMatchesQuery,
	MatchResponse,
} from "./types";
import type { BaseApiResponse } from "@/lib/types";
import { buildSearchParams } from "@/lib/helpers";

async function listMatches(query: ListMatchesQuery) {
	const searchParams = buildSearchParams(query);
	const response = await http.get<BaseApiResponse<MatchResponse[]>>(
		`/api/user/match?${searchParams.toString()}`,
	);
	return response.data;
}

async function createMatch(input: CreateMatchInput) {
	const response = await http.post<BaseApiResponse<MatchResponse>>(
		"/api/user/match",
		input,
	);
	return response.data;
}

async function deleteMatch(matchId: string) {
	const response = await http.delete<BaseApiResponse>(
		`/api/user/match/${matchId}`,
	);
	return response.data;
}

async function getMatch(matchId: string) {
	const response = await http.get<BaseApiResponse<MatchResponse>>(
		`/api/user/match/${matchId}`,
	);
	return response.data;
}

export const matchApi = {
	listMatches,
	createMatch,
	getMatch,
	deleteMatch,
} as const;
