import type { WeaponRarityEnum } from "@/lib/constants";
import z from "zod";

export interface WeaponCostMilestoneResponseItem {
    id: number;
    rarity: WeaponRarityEnum;
    cost: number;
    addTime: number;
}

export interface WeaponCostMilestoneResponse {
    upgradeLevel: number;
    items: WeaponCostMilestoneResponseItem[];
}

export const updateWeaponCostMilestonesSchema = z.object({
    cost: z.number().min(0),
    addTime: z.number().min(0),
});

export type UpdateWeaponCostMilestoneInput = z.infer<typeof updateWeaponCostMilestonesSchema>;