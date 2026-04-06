import { http } from "@/lib/http";
import type { BaseApiResponse } from "@/lib/types";
import type {
	MatchReportDetailResponse,
	SaveSessionRecordInput,
	SessionRecordResponse,
} from "./types";

async function saveSessionRecord(
	matchSessionId: number,
	input: SaveSessionRecordInput,
) {
	const response = await http.put<BaseApiResponse<SessionRecordResponse>>(
		`/api/user/session-record/${matchSessionId}/save`,
		input,
	);
	return response.data;
}

async function getMatchReport(matchId: string) {
	const response = await http.get<BaseApiResponse<MatchReportDetailResponse>>(
		`/api/user/session-record/${matchId}/report`,
	);
	return response.data;
}

export const sessionRecordApi = {
	saveSessionRecord,
	getMatchReport,
} as const;
