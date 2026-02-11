import {
	WeaponCostUnit,
	type WeaponCostUnitEnum,
	type WeaponRarityEnum,
} from "@/lib/constants";
import z from "zod";

export interface WeaponCostResponseItem {
	id: number;
	rarity: WeaponRarityEnum;
	value: number;
	unit: WeaponCostUnitEnum;
}

export interface WeaponCostResponse {
	upgradeLevel: number;
	items: WeaponCostResponseItem[];
}

export const updateWeaponCostSchema = z.object({
	value: z.number().min(0),
	unit: z.enum(WeaponCostUnit),
});

export type UpdateWeaponCostInput = z.infer<typeof updateWeaponCostSchema>;
