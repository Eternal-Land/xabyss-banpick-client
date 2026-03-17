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
import type { MatchStateResponse } from "@/apis/match/types";
import { userWeaponApis } from "@/apis/user-weapons";
import type {
	AccountCharacterQuery,
	AccountCharacterResponse,
} from "@/apis/account-characters/types";
import type {
	DraftAction,
	BanPickCharacter,
} from "@/components/match/ban-pick.types";
import { CharacterElementDetail, MatchType } from "@/lib/constants";
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

const MOCK_ACCOUNT_CHARACTER_QUERY: Omit<AccountCharacterQuery, "accountId"> =
	{};

const mapAccountCharacterToBanPickCharacter = (
	accountCharacter: AccountCharacterResponse,
): BanPickCharacter => ({
	name: accountCharacter.characters.name,
	imageUrl: accountCharacter.characters.iconUrl,
	rarity: (accountCharacter.characters.rarity === 5 ? 5 : 4) as 4 | 5,
	level: accountCharacter.characterLevel,
	constellation: accountCharacter.activatedConstellation,
	cost: accountCharacter.characterCost,
	element: accountCharacter.characters.element,
	weaponType: accountCharacter.characters.weaponType,
});

interface AccountDraftSideState {
	bans: AccountCharacterResponse[];
	picks: AccountCharacterResponse[];
}

interface AccountDraftState {
	blue: AccountDraftSideState;
	red: AccountDraftSideState;
}

const MOCK_DRAFT_SEQUENCE: DraftAction[] = [
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

const INITIAL_DRAFT_STATE: AccountDraftState = {
	blue: { bans: [], picks: [] },
	red: { bans: [], picks: [] },
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
	characterNames: string[],
) {
	const charactersByName = new Map(
		characters.map((character) => [
			character.characters.name.toLowerCase(),
			character,
		]),
	);

	return characterNames.flatMap((characterName) => {
		const mappedCharacter = charactersByName.get(characterName.toLowerCase());
		return mappedCharacter ? [mappedCharacter] : [];
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
	const [draftState, setDraftState] =
		useState<AccountDraftState>(INITIAL_DRAFT_STATE);
	const [draftStep, setDraftStep] = useState(0);
	const [turnRemainingSeconds, setTurnRemainingSeconds] = useState(
		TURN_DURATION_SECONDS,
	);
	const [pendingCharacter, setPendingCharacter] =
		useState<AccountCharacterResponse | null>(null);
	const [pageMatchState, setPageMatchState] = useState<
		MatchStateResponse | undefined
	>(matchState);
	const autoResolvedStepRef = useRef<number | null>(null);

	useSocketEvent(
		SocketEvent.UPDATE_MATCH_STATE,
		(nextMatchState: MatchStateResponse) => {
			setPageMatchState(nextMatchState);
		},
	);

	const { data: blueAccountCharactersResponse } = useQuery({
		queryKey: [
			"account-characters",
			{ ...MOCK_ACCOUNT_CHARACTER_QUERY, accountId: bluePlayer?.id },
		],
		queryFn: () => {
			if (!bluePlayer?.id) return Promise.reject("No blue player ID");
			return accountCharactersApi.listAccountCharacters({
				...MOCK_ACCOUNT_CHARACTER_QUERY,
				accountId: bluePlayer.id,
			});
		},
		enabled: Boolean(bluePlayer?.id),
	});

	const { data: redAccountCharactersResponse } = useQuery({
		queryKey: [
			"account-characters",
			{ ...MOCK_ACCOUNT_CHARACTER_QUERY, accountId: redPlayer?.id },
		],
		queryFn: () => {
			if (!redPlayer?.id) return Promise.reject("No red player ID");
			return accountCharactersApi.listAccountCharacters({
				...MOCK_ACCOUNT_CHARACTER_QUERY,
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

	const currentAction =
		draftStep < MOCK_DRAFT_SEQUENCE.length
			? MOCK_DRAFT_SEQUENCE[draftStep]
			: undefined;

	const isDraftCompleted = draftStep >= MOCK_DRAFT_SEQUENCE.length;

	const formattedTurnCountdown = useMemo(() => {
		const totalSeconds = isDraftCompleted ? 0 : turnRemainingSeconds;
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;

		return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
	}, [isDraftCompleted, turnRemainingSeconds]);

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

	const pendingBanPickCharacter = useMemo(
		() =>
			pendingCharacter
				? mapAccountCharacterToBanPickCharacter(pendingCharacter)
				: null,
		[pendingCharacter],
	);

	const applyCharacterToDraft = useCallback(
		(character: AccountCharacterResponse | null) => {
			if (
				!currentAction ||
				!character ||
				selectedCharacterNames.has(character.characters.name)
			) {
				return false;
			}

			setDraftState((prevState) => {
				const nextState: AccountDraftState = {
					blue: {
						bans: [...prevState.blue.bans],
						picks: [...prevState.blue.picks],
					},
					red: {
						bans: [...prevState.red.bans],
						picks: [...prevState.red.picks],
					},
				};

				const target = nextState[currentAction.side];

				if (currentAction.type === "ban") {
					target.bans.push(character);
				} else {
					target.picks.push(character);
				}

				return nextState;
			});

			setTurnRemainingSeconds(TURN_DURATION_SECONDS);
			setDraftStep((prevStep) => prevStep + 1);

			return true;
		},
		[currentAction, selectedCharacterNames],
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
			(character) => !selectedCharacterNames.has(character.characters.name),
		);

		if (availableOpenedListCharacters.length > 0) {
			return availableOpenedListCharacters;
		}

		const fallbackCharacters =
			currentAction.side === "blue" ? blueCharacters : redCharacters;

		return fallbackCharacters.filter(
			(character) => !selectedCharacterNames.has(character.characters.name),
		);
	}, [
		blueCharacters,
		currentAction,
		leftFilteredCharacters,
		redCharacters,
		rightFilteredCharacters,
		selectedCharacterNames,
	]);

	const onSelectCharacter = (character: AccountCharacterResponse) => {
		if (
			!currentAction ||
			selectedCharacterNames.has(character.characters.name)
		) {
			return;
		}

		setPendingCharacter(character);
	};

	const onConfirmCharacter = () => {
		const isConfirmed = applyCharacterToDraft(pendingCharacter);

		if (!isConfirmed) {
			return;
		}

		setPendingCharacter(null);
	};

	const onResetDraft = () => {
		setDraftState(INITIAL_DRAFT_STATE);
		setDraftStep(0);
		setTurnRemainingSeconds(TURN_DURATION_SECONDS);
		setPendingCharacter(null);
		autoResolvedStepRef.current = null;
	};

	const onFastForwardDraft = () => {
		if (isDraftCompleted) {
			return;
		}

		setDraftState((prevState) => {
			const nextState: AccountDraftState = {
				blue: {
					bans: [...prevState.blue.bans],
					picks: [...prevState.blue.picks],
				},
				red: {
					bans: [...prevState.red.bans],
					picks: [...prevState.red.picks],
				},
			};

			const selectedNames = new Set<string>();

			[
				...nextState.blue.bans,
				...nextState.blue.picks,
				...nextState.red.bans,
				...nextState.red.picks,
			].forEach((character) => selectedNames.add(character.characters.name));

			for (let step = draftStep; step < MOCK_DRAFT_SEQUENCE.length; step += 1) {
				const action = MOCK_DRAFT_SEQUENCE[step];
				const sidePool =
					action.side === "blue" ? blueCharacters : redCharacters;
				const availablePool = sidePool.filter(
					(character) => !selectedNames.has(character.characters.name),
				);

				if (availablePool.length === 0) {
					continue;
				}

				const randomCharacter =
					availablePool[Math.floor(Math.random() * availablePool.length)];
				selectedNames.add(randomCharacter.characters.name);

				if (action.type === "ban") {
					nextState[action.side].bans.push(randomCharacter);
				} else {
					nextState[action.side].picks.push(randomCharacter);
				}
			}

			return nextState;
		});

		setDraftStep(MOCK_DRAFT_SEQUENCE.length);
		setTurnRemainingSeconds(0);
		setPendingCharacter(null);
		autoResolvedStepRef.current = null;
		toast.info("Draft fast-forwarded");
	};

	useEffect(() => {
		setPageMatchState(matchState);
	}, [matchState]);

	useEffect(() => {
		if (!isRealtimeMatch || !pageMatchState) {
			return;
		}

		if (bluePlayer?.id && !blueAccountCharactersResponse) {
			return;
		}

		if (redPlayer?.id && !redAccountCharactersResponse) {
			return;
		}

		const nextDraftState: AccountDraftState = {
			blue: {
				bans: mapCharacterNamesToAccountCharacters(
					blueCharacters,
					pageMatchState.blueBanChars,
				),
				picks: mapCharacterNamesToAccountCharacters(
					blueCharacters,
					pageMatchState.blueSelectedChars,
				),
			},
			red: {
				bans: mapCharacterNamesToAccountCharacters(
					redCharacters,
					pageMatchState.redBanChars,
				),
				picks: mapCharacterNamesToAccountCharacters(
					redCharacters,
					pageMatchState.redSelectedChars,
				),
			},
		};

		setDraftState(nextDraftState);

		const nextDraftStep = Math.min(
			pageMatchState.blueBanChars.length +
				pageMatchState.blueSelectedChars.length +
				pageMatchState.redBanChars.length +
				pageMatchState.redSelectedChars.length,
			MOCK_DRAFT_SEQUENCE.length,
		);

		setDraftStep(nextDraftStep);
		setPendingCharacter(null);
		autoResolvedStepRef.current = null;
	}, [
		blueAccountCharactersResponse,
		blueCharacters,
		bluePlayer?.id,
		isRealtimeMatch,
		pageMatchState,
		redAccountCharactersResponse,
		redCharacters,
		redPlayer?.id,
	]);

	useEffect(() => {
		if (isDraftCompleted) {
			return;
		}

		setTurnRemainingSeconds(TURN_DURATION_SECONDS);
	}, [draftStep, isDraftCompleted]);

	useEffect(() => {
		if (isDraftCompleted || turnRemainingSeconds <= 0) {
			return;
		}

		const timeout = setTimeout(() => {
			setTurnRemainingSeconds((prev) => Math.max(0, prev - 1));
		}, 1000);

		return () => clearTimeout(timeout);
	}, [isDraftCompleted, turnRemainingSeconds]);

	useEffect(() => {
		if (isDraftCompleted || turnRemainingSeconds > 0 || !currentAction) {
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
			setDraftStep((prevStep) => prevStep + 1);
			setPendingCharacter(null);
			return;
		}

		const randomCharacter =
			availableCharacters[
				Math.floor(Math.random() * availableCharacters.length)
			];

		const isApplied = applyCharacterToDraft(randomCharacter);

		if (isApplied) {
			setPendingCharacter(null);
			toast.info(`Time over. Auto selected ${randomCharacter.characters.name}`);
		}
	}, [
		applyCharacterToDraft,
		currentAction,
		draftStep,
		getAvailableCharactersForAction,
		isDraftCompleted,
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
							<BanPickTimerInputs isRealtimeMatch={isRealtimeMatch} />
						</div>

						<div className="grid grid-rows-2 gap-4 h-full overflow-hidden">
							<div className="grid grid-cols-7 gap-8">
								<BanPickPlayerInfo side="blue" player={bluePlayer} />

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
								/>
							) : (
								<BanPickCharacterSelector
									side="blue"
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
									: `Step ${draftStep + 1}/${MOCK_DRAFT_SEQUENCE.length}: ${currentAction?.side.toUpperCase()} ${currentAction?.type.toUpperCase()}`}
							</p>
							<button
								type="button"
								onClick={onResetDraft}
								className="mt-3 h-8 w-full rounded-md border border-white/40 bg-white/10 text-xs hover:bg-white/20"
							>
								Reset mock draft
							</button>
							<button
								type="button"
								onClick={onFastForwardDraft}
								className="mt-2 h-8 w-full rounded-md border border-white/40 bg-white/10 text-xs hover:bg-white/20"
							>
								Fast forward draft
							</button>
						</div>

						<Button
							onClick={onConfirmCharacter}
							disabled={isDraftCompleted || !pendingCharacter}
						>
							Confirm
						</Button>
					</div>

					<div className="col-span-3 flex flex-col h-dvh p-4 gap-4">
						<div className="bg-transparent bg-radial from-red-400/50 from-0% to-white/0 to-70% fixed inset-0 z-[-2] left-[1500px] top-0 h-screen aspect-square rounded-full"></div>

						<div className="timer-side flex items-center gap-4">
							<BanPickTimerInputs isRealtimeMatch={isRealtimeMatch} />
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

								<BanPickPlayerInfo side="red" player={redPlayer} />
							</div>

							{isDraftCompleted ? (
								<BanPickTeamBuild
									picks={redBanPickPicks}
									weapons={weapons}
									titleClassName="text-red-600"
									slotClassName="bg-red-800/10 border-red-600/50"
									canReorder={canReorderRedTeam}
								/>
							) : (
								<BanPickCharacterSelector
									side="red"
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
