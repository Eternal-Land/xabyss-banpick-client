export const PlayerSide = {
	BLUE: 0,
	RED: 1,
} as const;

export type PlayerSideEnum = (typeof PlayerSide)[keyof typeof PlayerSide];
