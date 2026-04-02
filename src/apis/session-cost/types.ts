import type { PlayerSideEnum, WeaponRarityEnum } from "@/lib/constants";

export interface CalculateSessionCostInput {
	characterId?: number;
	activatedConstellation?: number;
	characterLevel?: number;
	weaponId?: number;
	weaponRefinement?: number;
	weaponRarity?: WeaponRarityEnum;
	side: PlayerSideEnum;
	currentTurn?: number;
}

export interface SessionCostResponse {
	id: number;
	matchSessionId: number;
	blueTotalCost: number;
	blueCostMilestone: number;
	blueConstellationCost: number;
	blueRefinementCost: number;
	blueLevelCost: number;
	blueTimeBonusCost: number;
	redTotalCost: number;
	redCostMilestone: number;
	redConstellationCost: number;
	redRefinementCost: number;
	redLevelCost: number;
	redTimeBonusCost: number;
}
