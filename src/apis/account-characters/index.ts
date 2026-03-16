import { http } from "@/lib/http";
import type { BaseApiResponse } from "@/lib/types";
import type {
	AccountCharacterQuery,
	AccountCharacterResponse,
	CreateAccountCharacterInput,
	UpdateAccountCharacterInput,
} from "./types";

async function listAccountCharacters(query: AccountCharacterQuery) {
	const searchParams = new URLSearchParams();
	if (query.characterId !== undefined) {
		searchParams.append("characterId", query.characterId.toString());
	}
	searchParams.append("accountId", query.accountId);

	const response = await http.get<BaseApiResponse<AccountCharacterResponse[]>>(
		`/api/account-character?${searchParams.toString()}`,
	);
	return response.data;
}

async function getAccountCharacter(id: string) {
	const response = await http.get<BaseApiResponse<AccountCharacterResponse>>(
		`/api/account-character/${id}`,
	);
	return response.data;
}

async function createAccountCharacter(input: CreateAccountCharacterInput) {
	const response = await http.post<BaseApiResponse<AccountCharacterResponse>>(
		"/api/account-character",
		input,
	);
	return response.data;
}

async function updateAccountCharacter(
	id: string,
	input: UpdateAccountCharacterInput,
) {
	const response = await http.put<BaseApiResponse<AccountCharacterResponse>>(
		`/api/account-character/${id}`,
		input,
	);
	return response.data;
}

async function deleteAccountCharacter(id: string) {
	const response = await http.delete<BaseApiResponse>(
		`/api/account-character/${id}`,
	);
	return response.data;
}

export const accountCharactersApi = {
	listAccountCharacters,
	getAccountCharacter,
	createAccountCharacter,
	updateAccountCharacter,
	deleteAccountCharacter,
} as const;
