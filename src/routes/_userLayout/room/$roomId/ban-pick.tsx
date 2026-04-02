import BanPickCharacterSelector from "@/components/match/ban-pick-character-selector";
import BanPickDraftSlots from "@/components/match/ban-pick-draft-slots";
import BanPickTeamBuild from "@/components/match/ban-pick-team-build";
import BanPickPlayerInfo from "@/components/match/ban-pick-player-info";
import BanPickTimerInputs from "@/components/match/ban-pick-timer-inputs";
import BanPickElementFilter, {
	ELEMENT_FILTER_ALL,
} from "@/components/match/ban-pick-element-filter";
import BanPickRarityFilter, {
	RARITY_FILTER_ALL,
} from "@/components/match/ban-pick-rarity-filter";
import { accountCharactersApi } from "@/apis/account-characters";
import { matchApi } from "@/apis/match";
import type { MatchStateResponse } from "@/apis/match/types";
import { sessionCostApi } from "@/apis/session-cost";
import type { SessionCostResponse } from "@/apis/session-cost/types";
import { sessionRecordApi } from "@/apis/session-record";
import type { SaveSessionRecordInput } from "@/apis/session-record/types";
import { userWeaponApis } from "@/apis/user-weapons";
import type { AccountCharacterResponse } from "@/apis/account-characters/types";
import type {
	DraftAction,
	BanPickCharacter,
} from "@/components/match/ban-pick.types";
import { CharacterElementDetail, MatchType, PlayerSide } from "@/lib/constants";
import { SocketEvent } from "@/lib/constants";
import { selectAuthProfile } from "@/lib/redux/auth.slice";
import { useAppSelector } from "@/hooks/use-app-selector";
import { useSocketEvent } from "@/hooks/use-socket-event";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_userLayout/room/$roomId/ban-pick")({
	component: RouteComponent,
});

const TURN_DURATION_SECONDS = 30;

const ACCOUNT_CHARACTER_QUERY = {};

const mapAccountCharacterToBanPickCharacter = (
	accountCharacter: AccountCharacterResponse,
): BanPickCharacter => ({
	id: accountCharacter.characterId.toString(),
	name: accountCharacter.characters.name,
	imageUrl: accountCharacter.characters.iconUrl,
	rarity: (accountCharacter.characters.rarity === 5 ? 5 : 4) as 4 | 5,
	level: accountCharacter.characterLevel,
	constellation: accountCharacter.activatedConstellation,
	cost: accountCharacter.characterCost,
	element: accountCharacter.characters.element,
	weaponType: accountCharacter.characters.weaponType,
});

const getBanPickCharacterId = (character: AccountCharacterResponse) =>
	character.characterId.toString();

const mapDraftSideToPlayerSide = (side: DraftAction["side"]) =>
	side === "blue" ? PlayerSide.BLUE : PlayerSide.RED;

function applyDraftActionToMatchState(
	prevState: MatchStateResponse,
	action: DraftAction,
	characterId: string,
	nextTurn?: MatchStateResponse["currentTurn"],
): MatchStateResponse {
	const nextState: MatchStateResponse = {
		...prevState,
		blueBanChars: [...prevState.blueBanChars],
		redBanChars: [...prevState.redBanChars],
		blueSelectedChars: [...prevState.blueSelectedChars],
		redSelectedChars: [...prevState.redSelectedChars],
	};

	if (action.type === "ban") {
		if (action.side === "blue") {
			nextState.blueBanChars.push(characterId);
		} else {
			nextState.redBanChars.push(characterId);
		}
	} else if (action.side === "blue") {
		nextState.blueSelectedChars.push(characterId);
	} else {
		nextState.redSelectedChars.push(characterId);
	}

	if (nextTurn !== undefined) {
		nextState.currentTurn = nextTurn;
	}

	return nextState;
}

function mapSelectedWeaponsByCharacterId(
	picks: AccountCharacterResponse[],
	weaponIds: string[],
) {
	const selectedByCharacterId: Record<string, number | undefined> = {};

	picks.forEach((character, index) => {
		const rawWeaponId = weaponIds[index];
		if (!rawWeaponId) {
			return;
		}

		const weaponId = Number(rawWeaponId);
		if (!Number.isInteger(weaponId) || weaponId <= 0) {
			return;
		}

		selectedByCharacterId[getBanPickCharacterId(character)] = weaponId;
	});

	return selectedByCharacterId;
}

interface AccountDraftSideState {
	bans: AccountCharacterResponse[];
	picks: AccountCharacterResponse[];
}

interface AccountDraftState {
	blue: AccountDraftSideState;
	red: AccountDraftSideState;
}

interface BanPickTimerSideValues {
	chamber1: number;
	chamber2: number;
	chamber3: number;
	resetTimes: number;
}

const DRAFT_SEQUENCE: DraftAction[] = [
	{ side: "blue", type: "ban" },
	{ side: "red", type: "ban" },
	{ side: "blue", type: "ban" },
	{ side: "red", type: "ban" },
	{ side: "blue", type: "pick" },
	{ side: "red", type: "pick" },
	{ side: "red", type: "pick" },
	{ side: "blue", type: "pick" },
	{ side: "blue", type: "pick" },
	{ side: "red", type: "pick" },
	{ side: "red", type: "pick" },
	{ side: "blue", type: "pick" },
	{ side: "red", type: "ban" },
	{ side: "blue", type: "ban" },
	{ side: "red", type: "pick" },
	{ side: "blue", type: "pick" },
	{ side: "blue", type: "pick" },
	{ side: "red", type: "pick" },
	{ side: "red", type: "pick" },
	{ side: "blue", type: "pick" },
	{ side: "blue", type: "pick" },
	{ side: "red", type: "pick" },
];

const EMPTY_DRAFT_STATE: AccountDraftState = {
	blue: { bans: [], picks: [] },
	red: { bans: [], picks: [] },
};

const EMPTY_SESSION_RECORD_INPUT: SaveSessionRecordInput = {
	blueChamber1: 0,
	blueChamber2: 0,
	blueChamber3: 0,
	blueResetTimes: 0,
	blueFinalTime: 0,
	redChamber1: 0,
	redChamber2: 0,
	redChamber3: 0,
	redResetTimes: 0,
	redFinalTime: 0,
};

function filterCharacters(
	characters: AccountCharacterResponse[],
	search: string,
	elementFilter: string,
	rarityFilter: string,
) {
	const normalizedSearch = search.trim().toLowerCase();

	return characters.filter((character) => {
		const matchesSearch =
			!normalizedSearch ||
			character.characters.name.toLowerCase().includes(normalizedSearch);

		const matchesElement =
			elementFilter === ELEMENT_FILTER_ALL ||
			CharacterElementDetail[character.characters.element].key ===
				elementFilter;

		const matchesRarity =
			rarityFilter === RARITY_FILTER_ALL ||
			character.characters.rarity.toString() === rarityFilter;

		return matchesSearch && matchesElement && matchesRarity;
	});
}

function mapCharacterNamesToAccountCharacters(
	characters: AccountCharacterResponse[],
	characterIdsOrNames: string[],
) {
	const charactersById = new Map(
		characters.flatMap((character) => [
			[getBanPickCharacterId(character), character] as const,
			[character.id, character] as const,
		]),
	);

	const charactersByName = new Map(
		characters.map((character) => [
			character.characters.name.toLowerCase(),
			character,
		]),
	);

	return characterIdsOrNames.flatMap((characterIdOrName) => {
		const normalizedValue = String(characterIdOrName).trim();
		if (!normalizedValue) {
			return [];
		}

		const mappedById = charactersById.get(normalizedValue);
		if (mappedById) {
			return [mappedById];
		}

		const mappedByName = charactersByName.get(normalizedValue.toLowerCase());
		if (mappedByName) {
			return [mappedByName];
		}

		return [];
	});
}

function RouteComponent() {
	const { match, matchState } = useLoaderData({
		from: "/_userLayout/room/$roomId",
	});
	const profile = useAppSelector(selectAuthProfile);
	const bluePlayer = match?.bluePlayer;
	const redPlayer = match?.redPlayer;
	const isRealtimeMatch = match?.type === MatchType.REALTIME;
	const canReorderBlueTeam = profile?.id === bluePlayer?.id;
	const canReorderRedTeam = profile?.id === redPlayer?.id;

	const [leftSearch, setLeftSearch] = useState("");
	const [rightSearch, setRightSearch] = useState("");
	const [leftElementFilter, setLeftElementFilter] =
		useState(ELEMENT_FILTER_ALL);
	const [leftRarityFilter, setLeftRarityFilter] = useState(RARITY_FILTER_ALL);

	const [rightElementFilter, setRightElementFilter] =
		useState(ELEMENT_FILTER_ALL);
	const [rightRarityFilter, setRightRarityFilter] = useState(RARITY_FILTER_ALL);
	const [turnRemainingSeconds, setTurnRemainingSeconds] = useState(
		TURN_DURATION_SECONDS,
	);
	const [pendingCharacter, setPendingCharacter] =
		useState<AccountCharacterResponse | null>(null);
	const [isSubmittingTurnAction, setIsSubmittingTurnAction] = useState(false);
	const [pageMatchState, setPageMatchState] = useState<
		MatchStateResponse | undefined
	>(matchState);
	const [sessionCost, setSessionCost] = useState<SessionCostResponse | null>(null);
	const [blueSelectedWeaponRefinementByCharacterId, setBlueSelectedWeaponRefinementByCharacterId] =
		useState<Record<string, number | undefined>>({});
	const [redSelectedWeaponRefinementByCharacterId, setRedSelectedWeaponRefinementByCharacterId] =
		useState<Record<string, number | undefined>>({});
	const autoResolvedStepRef = useRef<number | null>(null);
	const lastCalculatedTurnRef = useRef<string | null>(null);
	const sessionRecordInputRef = useRef<SaveSessionRecordInput>(
		EMPTY_SESSION_RECORD_INPUT,
	);

	const syncMatchStateFromServer = useCallback(async () => {
		if (!match?.id) {
			return;
		}

		try {
			const response = await matchApi.getMatchState(match.id);
			setPageMatchState(response.data);
		} catch {
			// Socket sync is best-effort and should not interrupt page interactions.
		}
	}, [match?.id]);

	const onDebouncedTimerValuesChange = useCallback(
		(side: "blue" | "red", values: BanPickTimerSideValues) => {
			const nextRecordInput: SaveSessionRecordInput =
				side === "blue"
					? {
						...sessionRecordInputRef.current,
						blueChamber1: values.chamber1,
						blueChamber2: values.chamber2,
						blueChamber3: values.chamber3,
						blueResetTimes: values.resetTimes,
						blueFinalTime:
							values.chamber1 + values.chamber2 + values.chamber3,
					}
					: {
						...sessionRecordInputRef.current,
						redChamber1: values.chamber1,
						redChamber2: values.chamber2,
						redChamber3: values.chamber3,
						redResetTimes: values.resetTimes,
						redFinalTime:
							values.chamber1 + values.chamber2 + values.chamber3,
					};

			sessionRecordInputRef.current = nextRecordInput;

			const matchSessionId = Number(pageMatchState?.currentSession);
			if (!Number.isInteger(matchSessionId) || matchSessionId <= 0) {
				return;
			}

			void sessionRecordApi
				.saveSessionRecord(matchSessionId, nextRecordInput)
				.catch(() => {
					// Session record autosave should not interrupt match flow.
				});
		},
		[pageMatchState?.currentSession],
	);

	useSocketEvent(
		SocketEvent.UPDATE_MATCH_SESSION,
		() => {
			void syncMatchStateFromServer();
		},
	);

	useSocketEvent(
		SocketEvent.UPDATE_BAN_PICK_SLOT,
		() => {
			void syncMatchStateFromServer();
		},
	);

	const { data: blueAccountCharactersResponse } = useQuery({
		queryKey: [
			"account-characters",
			{ ...ACCOUNT_CHARACTER_QUERY, accountId: bluePlayer?.id },
		],
		queryFn: () => {
			if (!bluePlayer?.id) return Promise.reject("No blue player ID");
			return accountCharactersApi.listAccountCharacters({
				...ACCOUNT_CHARACTER_QUERY,
				accountId: bluePlayer.id,
			});
		},
		enabled: Boolean(bluePlayer?.id),
	});

	const { data: redAccountCharactersResponse } = useQuery({
		queryKey: [
			"account-characters",
			{ ...ACCOUNT_CHARACTER_QUERY, accountId: redPlayer?.id },
		],
		queryFn: () => {
			if (!redPlayer?.id) return Promise.reject("No red player ID");
			return accountCharactersApi.listAccountCharacters({
				...ACCOUNT_CHARACTER_QUERY,
				accountId: redPlayer.id,
			});
		},
		enabled: Boolean(redPlayer?.id),
	});

	const { data: userWeaponsResponse } = useQuery({
		queryKey: ["user-weapons"],
		queryFn: userWeaponApis.listUserWeapons,
	});

	const blueCharacters = blueAccountCharactersResponse?.data ?? [];
	const redCharacters = redAccountCharactersResponse?.data ?? [];
	const weapons = userWeaponsResponse?.data ?? [];
	const allMatchCharacters = useMemo(
		() => [...blueCharacters, ...redCharacters],
		[blueCharacters, redCharacters],
	);

	const draftState = useMemo<AccountDraftState>(() => {
		if (!pageMatchState) {
			return EMPTY_DRAFT_STATE;
		}

		return {
			blue: {
				bans: mapCharacterNamesToAccountCharacters(
					allMatchCharacters,
					pageMatchState.blueBanChars,
				),
				picks: mapCharacterNamesToAccountCharacters(
					blueCharacters,
					pageMatchState.blueSelectedChars,
				),
			},
			red: {
				bans: mapCharacterNamesToAccountCharacters(
					allMatchCharacters,
					pageMatchState.redBanChars,
				),
				picks: mapCharacterNamesToAccountCharacters(
					redCharacters,
					pageMatchState.redSelectedChars,
				),
			},
		};
	}, [allMatchCharacters, blueCharacters, pageMatchState, redCharacters]);

	const draftStep = useMemo(() => {
		if (!pageMatchState) {
			return 0;
		}

		return Math.min(
			pageMatchState.blueBanChars.length +
				pageMatchState.blueSelectedChars.length +
				pageMatchState.redBanChars.length +
				pageMatchState.redSelectedChars.length,
			DRAFT_SEQUENCE.length,
		);
	}, [pageMatchState]);

	const currentAction =
		draftStep < DRAFT_SEQUENCE.length ? DRAFT_SEQUENCE[draftStep] : undefined;

	const isDraftCompleted = draftStep >= DRAFT_SEQUENCE.length;

	const formattedTurnCountdown = useMemo(() => {
		const totalSeconds = isDraftCompleted ? 0 : turnRemainingSeconds;
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;

		return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
	}, [isDraftCompleted, turnRemainingSeconds]);

	const isCurrentUserTurn = useMemo(() => {
		if (isDraftCompleted || !profile?.id || !currentAction) {
			return false;
		}

		const expectedTurn = mapDraftSideToPlayerSide(currentAction.side);

		if (profile.id === bluePlayer?.id) {
			return expectedTurn === PlayerSide.BLUE;
		}

		if (profile.id === redPlayer?.id) {
			return expectedTurn === PlayerSide.RED;
		}

		return false;
	}, [
		bluePlayer?.id,
		currentAction,
		isDraftCompleted,
		profile?.id,
		redPlayer?.id,
	]);

	const selectedCharacterNames = useMemo(() => {
		const selected = new Set<string>();

		[
			...draftState.blue.bans,
			...draftState.blue.picks,
			...draftState.red.bans,
			...draftState.red.picks,
		].forEach((character) => selected.add(character.characters.name));

		return selected;
	}, [draftState]);

	const selectedCharacterIds = useMemo(() => {
		const selected = new Set<string>();

		[
			...draftState.blue.bans,
			...draftState.blue.picks,
			...draftState.red.bans,
			...draftState.red.picks,
		].forEach((character) => selected.add(getBanPickCharacterId(character)));

		return selected;
	}, [draftState]);

	const leftFilteredCharacters = useMemo(
		() =>
			filterCharacters(
				blueCharacters,
				leftSearch,
				leftElementFilter,
				leftRarityFilter,
			),
		[blueCharacters, leftSearch, leftElementFilter, leftRarityFilter],
	);

	const rightFilteredCharacters = useMemo(
		() =>
			filterCharacters(
				redCharacters,
				rightSearch,
				rightElementFilter,
				rightRarityFilter,
			),
		[redCharacters, rightSearch, rightElementFilter, rightRarityFilter],
	);

	const leftFilteredBanPickCharacters = useMemo(
		() => leftFilteredCharacters.map(mapAccountCharacterToBanPickCharacter),
		[leftFilteredCharacters],
	);

	const rightFilteredBanPickCharacters = useMemo(
		() => rightFilteredCharacters.map(mapAccountCharacterToBanPickCharacter),
		[rightFilteredCharacters],
	);

	const blueBanPickBans = useMemo(
		() => draftState.blue.bans.map(mapAccountCharacterToBanPickCharacter),
		[draftState.blue.bans],
	);

	const blueBanPickPicks = useMemo(
		() => draftState.blue.picks.map(mapAccountCharacterToBanPickCharacter),
		[draftState.blue.picks],
	);

	const redBanPickBans = useMemo(
		() => draftState.red.bans.map(mapAccountCharacterToBanPickCharacter),
		[draftState.red.bans],
	);

	const redBanPickPicks = useMemo(
		() => draftState.red.picks.map(mapAccountCharacterToBanPickCharacter),
		[draftState.red.picks],
	);

	const blueSelectedWeaponByCharacterId = useMemo(
		() =>
			pageMatchState
				? mapSelectedWeaponsByCharacterId(
						draftState.blue.picks,
						pageMatchState.blueSelectedWeapons,
					)
				: {},
		[draftState.blue.picks, pageMatchState],
	);

	const redSelectedWeaponByCharacterId = useMemo(
		() =>
			pageMatchState
				? mapSelectedWeaponsByCharacterId(
						draftState.red.picks,
						pageMatchState.redSelectedWeapons,
					)
				: {},
		[draftState.red.picks, pageMatchState],
	);

	const blueDisabledWeaponIds = useMemo(() => {
		if (!pageMatchState) {
			return new Set<number>();
		}

		return new Set(
			pageMatchState.blueSelectedWeapons
				.map((weaponId) => Number(weaponId))
				.filter((weaponId) => Number.isInteger(weaponId) && weaponId > 0),
		);
	}, [pageMatchState]);

	const redDisabledWeaponIds = useMemo(() => {
		if (!pageMatchState) {
			return new Set<number>();
		}

		return new Set(
			pageMatchState.redSelectedWeapons
				.map((weaponId) => Number(weaponId))
				.filter((weaponId) => Number.isInteger(weaponId) && weaponId > 0),
		);
	}, [pageMatchState]);

	const pendingBanPickCharacter = useMemo(
		() =>
			pendingCharacter
				? mapAccountCharacterToBanPickCharacter(pendingCharacter)
				: null,
		[pendingCharacter],
	);

	const blueSideCost = useMemo(
		() => ({
			totalCost: sessionCost?.blueTotalCost,
			milestoneCost: sessionCost?.blueCostMilestone,
			constellationCost: sessionCost?.blueConstellationCost,
			refinementCost: sessionCost?.blueRefinementCost,
			levelCost: sessionCost?.blueLevelCost,
			timeBonusCost: sessionCost?.blueTimeBonusCost,
		}),
		[sessionCost],
	);

	const redSideCost = useMemo(
		() => ({
			totalCost: sessionCost?.redTotalCost,
			milestoneCost: sessionCost?.redCostMilestone,
			constellationCost: sessionCost?.redConstellationCost,
			refinementCost: sessionCost?.redRefinementCost,
			levelCost: sessionCost?.redLevelCost,
			timeBonusCost: sessionCost?.redTimeBonusCost,
		}),
		[sessionCost],
	);

	const getAvailableCharactersForAction = useCallback(() => {
		if (!currentAction) {
			return [] as AccountCharacterResponse[];
		}

		const openedListCharacters =
			currentAction.side === "blue"
				? leftFilteredCharacters
				: rightFilteredCharacters;

		const availableOpenedListCharacters = openedListCharacters.filter(
			(character) =>
				!selectedCharacterIds.has(getBanPickCharacterId(character)),
		);

		if (availableOpenedListCharacters.length > 0) {
			return availableOpenedListCharacters;
		}

		const fallbackCharacters =
			currentAction.side === "blue" ? blueCharacters : redCharacters;

		return fallbackCharacters.filter(
			(character) =>
				!selectedCharacterIds.has(getBanPickCharacterId(character)),
		);
	}, [
		blueCharacters,
		currentAction,
		leftFilteredCharacters,
		redCharacters,
		rightFilteredCharacters,
		selectedCharacterIds,
	]);

	const onSelectCharacter = (character: AccountCharacterResponse) => {
		if (
			!currentAction ||
			selectedCharacterIds.has(getBanPickCharacterId(character))
		) {
			return;
		}

		setPendingCharacter(character);
	};

	const onConfirmCharacter = async () => {
		if (!pendingCharacter || !currentAction || !match?.id) {
			return;
		}

		if (isSubmittingTurnAction) {
			return;
		}

		const characterId = getBanPickCharacterId(pendingCharacter);
		const nextAction = DRAFT_SEQUENCE[draftStep + 1];
		const ensuredNextTurn = nextAction
			? mapDraftSideToPlayerSide(nextAction.side)
			: undefined;
		const previousMatchState = pageMatchState;

		setPendingCharacter(null);
		setPageMatchState((prev) => {
			if (!prev) {
				return prev;
			}

			return applyDraftActionToMatchState(
				prev,
				currentAction,
				characterId,
				ensuredNextTurn,
			);
		});
		setIsSubmittingTurnAction(true);

		try {
			if (currentAction.type === "ban") {
				await matchApi.banChar(match.id, characterId);
			} else {
				await matchApi.pickChar(match.id, characterId);
			}

			if (nextAction && ensuredNextTurn !== undefined) {
				await matchApi.updateTurn(match.id, {
					turn: ensuredNextTurn,
				});
			}
		} catch {
			setPageMatchState(previousMatchState);
			toast.error("Failed to submit turn action");
		} finally {
			setIsSubmittingTurnAction(false);
		}
	};

	const onPickBlueWeapon = async (
		character: BanPickCharacter,
		weaponId: number,
		weaponRefinement: number,
	) => {
		if (!isRealtimeMatch || !match?.id) {
			return;
		}

		if (profile?.id !== bluePlayer?.id) {
			return;
		}

		try {
			await matchApi.pickWeapon(
				match.id,
				character.id,
				String(weaponId),
				weaponRefinement,
			);

			const matchSessionId = Number(pageMatchState?.currentSession);
			if (!Number.isInteger(matchSessionId) || matchSessionId <= 0) {
				return;
			}

			const pickedWeapon = weapons.find((weapon) => weapon.id === weaponId);
			const response = await sessionCostApi.calculateSessionCost(matchSessionId, {
				characterId: Number(character.id),
				activatedConstellation: character.constellation,
				characterLevel: character.level,
				weaponId,
				weaponRefinement,
				weaponRarity: pickedWeapon?.rarity,
				side: PlayerSide.BLUE,
			});

			if (response.data) {
				setSessionCost(response.data);
				setBlueSelectedWeaponRefinementByCharacterId((prev) => ({
					...prev,
					[character.id]: weaponRefinement,
				}));
			}
		} catch {
			toast.error(`Failed to pick weapon for ${character.name}`);
			throw new Error("Failed to pick weapon");
		}
	};

	const onPickRedWeapon = async (
		character: BanPickCharacter,
		weaponId: number,
		weaponRefinement: number,
	) => {
		if (!isRealtimeMatch || !match?.id) {
			return;
		}

		if (profile?.id !== redPlayer?.id) {
			return;
		}

		try {
			await matchApi.pickWeapon(
				match.id,
				character.id,
				String(weaponId),
				weaponRefinement,
			);

			const matchSessionId = Number(pageMatchState?.currentSession);
			if (!Number.isInteger(matchSessionId) || matchSessionId <= 0) {
				return;
			}

			const pickedWeapon = weapons.find((weapon) => weapon.id === weaponId);
			const response = await sessionCostApi.calculateSessionCost(matchSessionId, {
				characterId: Number(character.id),
				activatedConstellation: character.constellation,
				characterLevel: character.level,
				weaponId,
				weaponRefinement,
				weaponRarity: pickedWeapon?.rarity,
				side: PlayerSide.RED,
			});

			if (response.data) {
				setSessionCost(response.data);
				setRedSelectedWeaponRefinementByCharacterId((prev) => ({
					...prev,
					[character.id]: weaponRefinement,
				}));
			}
		} catch {
			toast.error(`Failed to pick weapon for ${character.name}`);
			throw new Error("Failed to pick weapon");
		}
	};

	useEffect(() => {
		setPageMatchState(matchState);
		setSessionCost(null);
		setBlueSelectedWeaponRefinementByCharacterId({});
		setRedSelectedWeaponRefinementByCharacterId({});
		sessionRecordInputRef.current = EMPTY_SESSION_RECORD_INPUT;
		lastCalculatedTurnRef.current = null;
	}, [matchState]);

	useEffect(() => {
		if (!match?.id || !pageMatchState) {
			return;
		}

		const matchSessionId = Number(pageMatchState.currentSession);
		if (!Number.isInteger(matchSessionId) || matchSessionId <= 0) {
			setSessionCost(null);
			return;
		}

		let isCancelled = false;

		void (async () => {
			try {
				const response = await sessionCostApi.getCurrentSessionCost(match.id);
				if (!isCancelled) {
					setSessionCost(response.data ?? null);
				}
			} catch {
				if (!isCancelled) {
					setSessionCost(null);
				}
			}
		})();

		return () => {
			isCancelled = true;
		};
	}, [match?.id, pageMatchState?.currentSession]);

	useEffect(() => {
		if (!pageMatchState) {
			return;
		}

		if (isDraftCompleted) {
			return;
		}

		const matchSessionId = Number(pageMatchState.currentSession);
		if (!Number.isInteger(matchSessionId) || matchSessionId <= 0) {
			return;
		}

		const completedTurn = draftStep - 1;
		if (completedTurn < 0) {
			return;
		}

		const latestAction = DRAFT_SEQUENCE[completedTurn];
		if (!latestAction) {
			return;
		}

		const latestCharacters =
			latestAction.type === "ban"
				? draftState[latestAction.side].bans
				: draftState[latestAction.side].picks;

		const latestCharacter = latestCharacters[latestCharacters.length - 1];
		if (!latestCharacter) {
			return;
		}

		const latestCharacterId = getBanPickCharacterId(latestCharacter);
		const lastCalculatedKey = [
			matchSessionId,
			completedTurn,
			latestAction.side,
			latestAction.type,
			latestCharacterId,
		].join(":");

		if (lastCalculatedTurnRef.current === lastCalculatedKey) {
			return;
		}

		// Reserve key before requesting to avoid duplicate calls from rapid state updates
		// (e.g. optimistic update + socket sync for the same turn).
		lastCalculatedTurnRef.current = lastCalculatedKey;

		const selectedWeaponId =
			latestAction.type === "pick"
				? latestAction.side === "blue"
					? blueSelectedWeaponByCharacterId[latestCharacterId]
					: redSelectedWeaponByCharacterId[latestCharacterId]
				: undefined;

		const selectedWeapon = selectedWeaponId
			? weapons.find((weapon) => weapon.id === selectedWeaponId)
			: undefined;

		const selectedWeaponRefinement =
			latestAction.type === "pick"
				? latestAction.side === "blue"
					? blueSelectedWeaponRefinementByCharacterId[latestCharacterId]
					: redSelectedWeaponRefinementByCharacterId[latestCharacterId]
				: undefined;

		void (async () => {
			try {
				const response = await sessionCostApi.calculateSessionCost(matchSessionId, {
					characterId: latestCharacter.characterId,
					activatedConstellation: latestCharacter.activatedConstellation,
					characterLevel: latestCharacter.characterLevel,
					weaponId: selectedWeapon?.id,
					weaponRefinement:
						selectedWeaponRefinement ?? (selectedWeapon ? 1 : undefined),
					weaponRarity: selectedWeapon?.rarity,
					side: mapDraftSideToPlayerSide(latestAction.side),
					currentTurn: completedTurn,
				});

				if (response.data) {
					setSessionCost(response.data);
				}
			} catch {
				if (lastCalculatedTurnRef.current === lastCalculatedKey) {
					lastCalculatedTurnRef.current = null;
				}
				// Cost calculation is best-effort and should not block draft flow.
			}
		})();
	}, [
		blueSelectedWeaponByCharacterId,
		blueSelectedWeaponRefinementByCharacterId,
		draftState,
		draftStep,
		isDraftCompleted,
		pageMatchState,
		redSelectedWeaponByCharacterId,
		redSelectedWeaponRefinementByCharacterId,
		weapons,
	]);

	useEffect(() => {
		if (isDraftCompleted) {
			return;
		}

		setTurnRemainingSeconds(TURN_DURATION_SECONDS);
	}, [draftStep, isDraftCompleted]);

	useEffect(() => {
		if (isDraftCompleted || turnRemainingSeconds <= 0 || !isCurrentUserTurn) {
			return;
		}

		const timeout = setTimeout(() => {
			setTurnRemainingSeconds((prev) => Math.max(0, prev - 1));
		}, 1000);

		return () => clearTimeout(timeout);
	}, [isCurrentUserTurn, isDraftCompleted, turnRemainingSeconds]);

	useEffect(() => {
		if (
			isDraftCompleted ||
			turnRemainingSeconds > 0 ||
			!currentAction ||
			!isCurrentUserTurn
		) {
			return;
		}

		if (autoResolvedStepRef.current === draftStep) {
			return;
		}

		autoResolvedStepRef.current = draftStep;

		const availableCharacters = getAvailableCharactersForAction();

		if (availableCharacters.length === 0) {
			toast.error("No character available for auto pick");
			setTurnRemainingSeconds(TURN_DURATION_SECONDS);
			setPendingCharacter(null);
			autoResolvedStepRef.current = null;
			return;
		}

		const randomCharacter =
			availableCharacters[
				Math.floor(Math.random() * availableCharacters.length)
			];
		const randomCharacterId = getBanPickCharacterId(randomCharacter);
		const nextAction = DRAFT_SEQUENCE[draftStep + 1];
		const ensuredNextTurn = nextAction
			? mapDraftSideToPlayerSide(nextAction.side)
			: undefined;
		const previousMatchState = pageMatchState;

		if (isSubmittingTurnAction || !match?.id) {
			return;
		}

		setPageMatchState((prev) => {
			if (!prev) {
				return prev;
			}

			return applyDraftActionToMatchState(
				prev,
				currentAction,
				randomCharacterId,
				ensuredNextTurn,
			);
		});
		setIsSubmittingTurnAction(true);

		void (async () => {
			try {
				if (currentAction.type === "ban") {
					await matchApi.banChar(match.id, randomCharacterId);
				} else {
					await matchApi.pickChar(match.id, randomCharacterId);
				}

				if (nextAction && ensuredNextTurn !== undefined) {
					await matchApi.updateTurn(match.id, {
						turn: ensuredNextTurn,
					});
				}

				setPendingCharacter(null);
				toast.info(
					`Time over. Auto selected ${randomCharacter.characters.name}`,
				);
			} catch {
				setPageMatchState(previousMatchState);
				toast.error("Failed to auto submit turn action");
				setTurnRemainingSeconds(TURN_DURATION_SECONDS);
				autoResolvedStepRef.current = null;
			} finally {
				setIsSubmittingTurnAction(false);
			}
		})();
	}, [
		currentAction,
		draftStep,
		getAvailableCharactersForAction,
		isDraftCompleted,
		isCurrentUserTurn,
		isSubmittingTurnAction,
		match?.id,
		turnRemainingSeconds,
	]);

	return (
		<>
			<div className="min-h-screen max-w-screen overflow-hidden">
				<div className="grid grid-cols-7 h-dvh gap-4">
					<div className="col-span-3 flex flex-col h-dvh p-4 gap-4">
						{/* Background blue side */}
						<div className="bg-transparent bg-radial from-sky-400/50 from-0% to-white/0 to-70% fixed inset-0 z-[-2] left-[-500px] top-0 h-screen aspect-square rounded-full"></div>

						{/* Timer */}
						<div className="timer-side flex items-center gap-4">
							<BanPickTimerInputs
								isRealtimeMatch={isRealtimeMatch}
								side="blue"
								onDebouncedValuesChange={onDebouncedTimerValuesChange}
							/>
						</div>

						<div className="grid grid-rows-2 gap-4 h-full overflow-hidden">
							<div className="grid grid-cols-7 gap-8">
								<BanPickPlayerInfo
									side="blue"
									player={bluePlayer}
									cost={blueSideCost}
								/>

								<BanPickDraftSlots
									side="blue"
									bans={blueBanPickBans}
									picks={blueBanPickPicks}
									currentAction={currentAction}
									isDraftCompleted={isDraftCompleted}
									pendingCharacter={pendingBanPickCharacter}
								/>
							</div>
							{isDraftCompleted ? (
								<BanPickTeamBuild
									picks={blueBanPickPicks}
									weapons={weapons}
									titleClassName="text-sky-400"
									slotClassName="bg-sky-800/10 border-sky-400/50"
									canReorder={canReorderBlueTeam}
									canPickWeapon={profile?.id === bluePlayer?.id}
									disabledWeaponIds={
										profile?.id === bluePlayer?.id
											? blueDisabledWeaponIds
											: undefined
									}
									selectedWeaponByCharacterId={blueSelectedWeaponByCharacterId}
									onPickWeapon={onPickBlueWeapon}
								/>
							) : (
								<BanPickCharacterSelector
									side="blue"
									canInteract={isCurrentUserTurn}
									search={leftSearch}
									onSearchChange={setLeftSearch}
									renderElementFilter={
										<BanPickElementFilter
											selectedElement={leftElementFilter}
											onSelect={setLeftElementFilter}
										/>
									}
									renderRarityFilter={
										<BanPickRarityFilter
											selectedRarity={leftRarityFilter}
											onSelect={setLeftRarityFilter}
										/>
									}
									characters={leftFilteredBanPickCharacters}
									selectedCharacterNames={selectedCharacterNames}
									pendingCharacter={pendingBanPickCharacter}
									isDraftCompleted={isDraftCompleted}
									currentAction={currentAction}
									onSelectCharacter={(character) => {
										const selected = leftFilteredCharacters.find(
											(item) => item.characters.name === character.name,
										);
										if (!selected) {
											return;
										}
										onSelectCharacter(selected);
									}}
								/>
							)}
						</div>
					</div>

					<div className="col-span-1 flex flex-col items-center justify-between p-4">
						<div className="w-full mt-4 rounded-md border border-white/30 bg-white/5 p-3 text-center">
							<h1 className="text-2xl">{formattedTurnCountdown}</h1>
							<p className="mt-3 text-xs text-white/80">
								{isDraftCompleted
									? "Draft completed"
									: `Step ${draftStep + 1}/${DRAFT_SEQUENCE.length}: ${currentAction?.side.toUpperCase()} ${currentAction?.type.toUpperCase()}`}
							</p>
						</div>

						<Button
							onClick={onConfirmCharacter}
							disabled={
								isDraftCompleted ||
								!isCurrentUserTurn ||
								!pendingCharacter ||
								isSubmittingTurnAction
							}
						>
							Confirm
						</Button>
					</div>

					<div className="col-span-3 flex flex-col h-dvh p-4 gap-4">
						<div className="bg-transparent bg-radial from-red-400/50 from-0% to-white/0 to-70% fixed inset-0 z-[-2] left-[1500px] top-0 h-screen aspect-square rounded-full"></div>

						<div className="timer-side flex items-center gap-4">
							<BanPickTimerInputs
								isRealtimeMatch={isRealtimeMatch}
								side="red"
								onDebouncedValuesChange={onDebouncedTimerValuesChange}
							/>
						</div>

						<div className="grid grid-rows-2 gap-4 h-full overflow-hidden">
							<div className="grid grid-cols-7 gap-8">
								<BanPickDraftSlots
									side="red"
									bans={redBanPickBans}
									picks={redBanPickPicks}
									currentAction={currentAction}
									isDraftCompleted={isDraftCompleted}
									pendingCharacter={pendingBanPickCharacter}
								/>

								<BanPickPlayerInfo
									side="red"
									player={redPlayer}
									cost={redSideCost}
								/>
							</div>

							{isDraftCompleted ? (
								<BanPickTeamBuild
									picks={redBanPickPicks}
									weapons={weapons}
									titleClassName="text-red-600"
									slotClassName="bg-red-800/10 border-red-600/50"
									canReorder={canReorderRedTeam}
									canPickWeapon={profile?.id === redPlayer?.id}
									disabledWeaponIds={
										profile?.id === redPlayer?.id
											? redDisabledWeaponIds
											: undefined
									}
									selectedWeaponByCharacterId={redSelectedWeaponByCharacterId}
									onPickWeapon={onPickRedWeapon}
								/>
							) : (
								<BanPickCharacterSelector
									side="red"
									canInteract={isCurrentUserTurn}
									search={rightSearch}
									onSearchChange={setRightSearch}
									renderElementFilter={
										<BanPickElementFilter
											selectedElement={rightElementFilter}
											onSelect={setRightElementFilter}
										/>
									}
									renderRarityFilter={
										<BanPickRarityFilter
											selectedRarity={rightRarityFilter}
											onSelect={setRightRarityFilter}
										/>
									}
									characters={rightFilteredBanPickCharacters}
									selectedCharacterNames={selectedCharacterNames}
									pendingCharacter={pendingBanPickCharacter}
									isDraftCompleted={isDraftCompleted}
									currentAction={currentAction}
									onSelectCharacter={(character) => {
										const selected = rightFilteredCharacters.find(
											(item) => item.characters.name === character.name,
										);
										if (!selected) {
											return;
										}
										onSelectCharacter(selected);
									}}
								/>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
