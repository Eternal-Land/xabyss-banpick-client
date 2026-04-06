export interface SaveSessionRecordInput {
	blueChamber1: number;
	blueChamber2: number;
	blueChamber3: number;
	blueResetTimes: number;
	blueFinalTime: number;
	redChamber1: number;
	redChamber2: number;
	redChamber3: number;
	redResetTimes: number;
	redFinalTime: number;
}

export interface SessionRecordResponse extends SaveSessionRecordInput {
	id: number;
	matchSessionId: number;
}

export interface MatchSessionReportItemResponse {
	matchSessionId: number;
	sessionIndex: number;
	sessionStatus: number;
	currentTurn: number;
	totalCostBlue: number;
	totalCostRed: number;
	blueParticipant: any | null;
	redParticipant: any | null;
	winnerSide: number | null;
	blueFinalTime: number | null;
	redFinalTime: number | null;
	record: SessionRecordResponse | null;
	cost: any | null;
}

export interface MatchReportDetailResponse {
	matchId: string;
	status: number;
	type: number;
	sessionCount: number;
	host: any | null;
	redPlayer: any | null;
	bluePlayer: any | null;
	sessions: MatchSessionReportItemResponse[];
}
