import { http } from "@/lib/http";
import type { BaseApiResponse } from "@/lib/types";
import type {
	CalculateSessionCostInput,
	SessionCostResponse,
} from "@/apis/session-cost/types";

async function calculateSessionCost(
	matchSessionId: number,
	input: CalculateSessionCostInput,
) {
	const response = await http.put<BaseApiResponse<SessionCostResponse>>(
		`/api/user/session-cost/${matchSessionId}/calculate`,
		input,
	);
	return response.data;
}

async function getCurrentSessionCost(matchId: string) {
	const response = await http.get<BaseApiResponse<SessionCostResponse>>(
		`/api/user/session-cost/${matchId}/current`,
	);
	return response.data;
}

export const sessionCostApi = {
	calculateSessionCost,
	getCurrentSessionCost,
} as const;
