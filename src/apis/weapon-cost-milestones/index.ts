import { http } from "@/lib/http";
import type { BaseApiResponse } from "@/lib/types";
import type { UpdateWeaponCostMilestoneInput, WeaponCostMilestoneResponse } from "./types";

async function listWeaponCostMilestones() {
    const response = await http.get<BaseApiResponse<WeaponCostMilestoneResponse[]>>("/api/admin/weapon-cost-milestones");
    return response.data;
}

async function updateWeaponCostMilestone(id: number, input: UpdateWeaponCostMilestoneInput) {
    const response = await http.put<BaseApiResponse>(`/api/admin/weapon-cost-milestones/${id}`, input);
    return response.data;
}

export const weaponCostMilestonesApi = {
    listWeaponCostMilestones,
    updateWeaponCostMilestone,
} as const;