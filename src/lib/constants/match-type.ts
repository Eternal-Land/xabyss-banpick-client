export const MatchType = {
	REALTIME: 0,
	TURN_BASED: 1,
} as const;

export type MatchTypeEnum = (typeof MatchType)[keyof typeof MatchType];
