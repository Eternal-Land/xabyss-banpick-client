import { http } from "@/lib/http";
import type {
	CreateMatchInput,
	InviteToMatchInput,
	ListMatchesQuery,
	MatchResponse,
	UpdateMatchInput,
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

async function updateMatch(matchId: string, input: UpdateMatchInput) {
	const response = await http.put<BaseApiResponse<MatchResponse>>(
		`/api/user/match/${matchId}`,
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

async function inviteToMatch(input: InviteToMatchInput) {
	const response = await http.post<BaseApiResponse>(
		`/api/user/match/invite`,
		input,
	);
	return response.data;
}

async function acceptMatchInvitation(invitationId: string) {
	const response = await http.post<BaseApiResponse>(
		`/api/user/match/accept-invitation/${invitationId}`,
	);
	return response.data;
}

async function denyMatchInvitation(invitationId: string) {
	const response = await http.post<BaseApiResponse>(
		`/api/user/match/deny-invitation/${invitationId}`,
	);
	return response.data;
}

async function removeParticipant(matchId: string, participantId: string) {
	const response = await http.post<BaseApiResponse>(
		`/api/user/match/${matchId}/remove-participant/${participantId}`,
	);
	return response.data;
}

async function joinAsParticipant(matchId: string) {
	const response = await http.post<BaseApiResponse>(
		`/api/user/match/${matchId}/join`,
	);
	return response.data;
}

async function leaveMatch(matchId: string) {
	const response = await http.post<BaseApiResponse>(
		`/api/user/match/${matchId}/leave`,
	);
	return response.data;
}

export const matchApi = {
	listMatches,
	createMatch,
	getMatch,
	updateMatch,
	deleteMatch,
	inviteToMatch,
	acceptMatchInvitation,
	denyMatchInvitation,
	removeParticipant,
	joinAsParticipant,
	leaveMatch,
} as const;
