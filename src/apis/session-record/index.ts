import { http } from "@/lib/http";
import type { BaseApiResponse } from "@/lib/types";
import type { SaveSessionRecordInput, SessionRecordResponse } from "./types";

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

export const sessionRecordApi = {
	saveSessionRecord,
} as const;
