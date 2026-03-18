import { http } from "@/lib/http";
import type { BaseApiResponse } from "@/lib/types";
import type { UserWeaponResponse } from "./types";

async function listUserWeapons() {
	const response =
		await http.get<BaseApiResponse<UserWeaponResponse[]>>("/api/user/weapons");
	return response.data;
}

export const userWeaponApis = {
	listUserWeapons,
} as const;
