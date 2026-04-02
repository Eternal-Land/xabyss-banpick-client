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
