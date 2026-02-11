import { http } from "@/lib/http";
import type { BaseApiResponse } from "@/lib/types";
import type { UpdateWeaponCostInput, WeaponCostResponse } from "./types";

async function listWeaponCosts() {
	const response = await http.get<BaseApiResponse<WeaponCostResponse[]>>(
		"/api/admin/weapon-costs",
	);
	return response.data;
}

async function updateWeaponCost(id: number, input: UpdateWeaponCostInput) {
	const response = await http.put<BaseApiResponse>(
		`/api/admin/weapon-costs/${id}`,
		input,
	);
	return response.data;
}

export const weaponCostsApi = {
	listWeaponCosts,
	updateWeaponCost,
} as const;
