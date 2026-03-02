import type { CharacterElementEnum } from "@/lib/constants";

export type CharacterRarity = 4 | 5;

export interface BanPickCharacter {
	name: string;
	imageUrl: string;
	rarity: CharacterRarity;
	level: number;
	constellation: number;
	element: CharacterElementEnum;
}

export interface SideDraftState {
	bans: BanPickCharacter[];
	picks: BanPickCharacter[];
}

export interface DraftState {
	blue: SideDraftState;
	red: SideDraftState;
}

export type DraftSide = "blue" | "red";
export type DraftActionType = "ban" | "pick";

export interface DraftAction {
	side: DraftSide;
	type: DraftActionType;
}
