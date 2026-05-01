import { accountCharactersApi } from "@/apis/account-characters";
import type { AccountCharacterResponse } from "@/apis/account-characters/types";
import { userCharactersApi } from "@/apis/user-characters";
import type { UserCharacterResponse } from "@/apis/user-characters/types";
import { userWeaponApis } from "@/apis/user-weapons";
import type { UserWeaponResponse } from "@/apis/user-weapons/types";
import { useQuery } from "@tanstack/react-query";

const ACCOUNT_CHARACTER_QUERY = {};

interface UseBanPickQueriesParams {
	accountId?: string;
}

interface UseBanPickQueriesResult {
	accountCharacters: AccountCharacterResponse[];
	globalCharacters: UserCharacterResponse[];
	weapons: UserWeaponResponse[];
}

export function useBanPickQueries({
	accountId,
}: UseBanPickQueriesParams): UseBanPickQueriesResult {
	const { data: accountCharactersResponse } = useQuery({
		queryKey: ["account-characters", { ...ACCOUNT_CHARACTER_QUERY, accountId }],
		queryFn: () => {
			if (!accountId) {
				return Promise.reject("No account ID");
			}

			return accountCharactersApi.listAccountCharacters({
				...ACCOUNT_CHARACTER_QUERY,
				accountId,
			});
		},
		enabled: Boolean(accountId),
	});

	const { data: userWeaponsResponse } = useQuery({
		queryKey: ["user-weapons"],
		queryFn: userWeaponApis.listUserWeapons,
	});

	const { data: globalCharactersResponse } = useQuery({
		queryKey: ["user-characters"],
		queryFn: userCharactersApi.listCharacters,
	});

	return {
		accountCharacters: accountCharactersResponse?.data ?? [],
		globalCharacters: globalCharactersResponse?.data ?? [],
		weapons: userWeaponsResponse?.data ?? [],
	};
}
