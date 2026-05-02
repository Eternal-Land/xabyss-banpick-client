import type { CharacterElementEnum, WeaponTypeEnum } from "@/lib/constants";

export type CharacterRarity = 4 | 5;

export interface BanPickCharacter {
	id: string;
	name: string;
	imageUrl: string;
	rarity: CharacterRarity;
	level: number;
	constellation: number;
	cost: number;
	element: CharacterElementEnum;
	weaponType: WeaponTypeEnum;
}

export interface SideDraftState {
	bans: (BanPickCharacter | null)[];
	picks: (BanPickCharacter | null)[];
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
