import { http } from "@/lib/http";
import type {
	CreateMatchInput,
	ListMatchesQuery,
	MatchResponse,
	MatchStateResponse,
	UpdateMatchTurnInput,
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

async function getMatchState(matchId: string) {
	const response = await http.get<BaseApiResponse<MatchStateResponse>>(
		`/api/user/match/${matchId}/state`,
	);
	return response.data;
}

async function startMatch(matchId: string) {
	const response = await http.put<BaseApiResponse>(
		`/api/user/match/${matchId}/start`,
	);
	return response.data;
}

async function pickChar(matchId: string, charId: string) {
	const response = await http.put<BaseApiResponse>(
		`/api/user/match/${matchId}/pick-char/${charId}`,
	);
	return response.data;
}

async function banChar(matchId: string, charId: string) {
	const response = await http.put<BaseApiResponse>(
		`/api/user/match/${matchId}/ban-char/${charId}`,
	);
	return response.data;
}

async function pickWeapon(matchId: string, charId: string, weaponId: string) {
	const response = await http.put<BaseApiResponse>(
		`/api/user/match/${matchId}/pick-weapon/${charId}/${weaponId}`,
	);
	return response.data;
}

async function updateTurn(matchId: string, input: UpdateMatchTurnInput) {
	const response = await http.put<BaseApiResponse<MatchStateResponse>>(
		`/api/user/match/${matchId}/turn`,
		input,
	);
	return response.data;
}

export const matchApi = {
	listMatches,
	createMatch,
	getMatch,
	getMatchState,
	deleteMatch,
	startMatch,
	updateTurn,
	pickChar,
	banChar,
	pickWeapon,
} as const;
