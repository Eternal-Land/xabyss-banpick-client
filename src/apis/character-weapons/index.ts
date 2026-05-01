import { http } from "@/lib/http";
import type { BaseApiResponse } from "@/lib/types";
import type {
	CharacterWeaponResponse,
	CreateCharacterWeaponInput,
	UpdateCharacterWeaponInput,
} from "./types";

async function listCharacterWeapons() {
	const response = await http.get<BaseApiResponse<CharacterWeaponResponse[]>>(
		"/api/admin/character-weapons",
	);
	return response.data;
}

async function createCharacterWeapon(input: CreateCharacterWeaponInput) {
	const response = await http.post<BaseApiResponse<CharacterWeaponResponse>>(
		"/api/admin/character-weapons",
		input,
	);
	return response.data;
}

async function updateCharacterWeapon(
	id: number,
	input: UpdateCharacterWeaponInput,
) {
	const response = await http.put<BaseApiResponse<CharacterWeaponResponse>>(
		`/api/admin/character-weapons/${id}`,
		input,
	);
	return response.data;
}

async function deleteCharacterWeapon(id: number) {
	const response = await http.delete<BaseApiResponse<CharacterWeaponResponse>>(
		`/api/admin/character-weapons/${id}`,
	);
	return response.data;
}

export const characterWeaponsApi = {
	listCharacterWeapons,
	createCharacterWeapon,
	updateCharacterWeapon,
	deleteCharacterWeapon,
} as const;
