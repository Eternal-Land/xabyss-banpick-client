export const MatchStatus = {
	WAITING: 1,
	LIVE: 2,
	COMPLETED: 3,
	CANCELED: 4,
} as const;

export type MatchStatusEnum = (typeof MatchStatus)[keyof typeof MatchStatus];
