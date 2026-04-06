import BanPickActionPanel from "@/components/match/ban-pick-action-panel";
import BanPickSideSection from "@/components/match/ban-pick-side-section";
import {
	applyDraftActionToMatchState,
	DRAFT_SEQUENCE,
	EMPTY_SESSION_RECORD_INPUT,
	filterCharacters,
	getBanPickCharacterId,
	mapAccountCharacterToBanPickCharacter,
	mapCharacterNamesToAccountCharacters,
	mapDraftSideToPlayerSide,
	mapSelectedWeaponsByCharacterId,
	TURN_DURATION_SECONDS,
	validateSessionCompletionData,
} from "@/components/match/ban-pick.utils";
import { matchApi } from "@/apis/match";
import type { MatchStateResponse } from "@/apis/match/types";
import { sessionCostApi } from "@/apis/session-cost";
import type { SessionCostResponse } from "@/apis/session-cost/types";
import { sessionRecordApi } from "@/apis/session-record";
import type { SaveSessionRecordInput } from "@/apis/session-record/types";
import type { AccountCharacterResponse } from "@/apis/account-characters/types";
import type { BanPickCharacter } from "@/components/match/ban-pick.types";
import { MatchType, PlayerSide, MatchStatus } from "@/lib/constants";
import { SocketEvent } from "@/lib/constants";
import { selectAuthProfile } from "@/lib/redux/auth.slice";
import { useAppSelector } from "@/hooks/use-app-selector";
import { useSocketEvent } from "@/hooks/use-socket-event";
import { useDebounce } from "@/hooks/use-debounce";
import { useBanPickFilters } from "@/hooks/use-ban-pick-filters";
import { useBanPickQueries } from "@/hooks/use-ban-pick-queries";
import {
	createFileRoute,
	useLoaderData,
	useRouter,
} from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_userLayout/room/$roomId/ban-pick")({
	component: RouteComponent,
});

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

const EMPTY_DRAFT_STATE: AccountDraftState = {
	blue: { bans: [], picks: [] },
	red: { bans: [], picks: [] },
};

function RouteComponent() {
	const { match, matchState } = useLoaderData({
		from: "/_userLayout/room/$roomId",
	});
	const router = useRouter();
	const profile = useAppSelector(selectAuthProfile);
	const bluePlayer = match?.bluePlayer;
	const redPlayer = match?.redPlayer;
	const isRealtimeMatch = match?.type === MatchType.REALTIME;
	const canReorderBlueTeam = profile?.id === bluePlayer?.id;
	const canReorderRedTeam = profile?.id === redPlayer?.id;

	const {
		leftSearch,
		setLeftSearch,
		rightSearch,
		setRightSearch,
		leftElementFilter,
		setLeftElementFilter,
		leftRarityFilter,
		setLeftRarityFilter,
		rightElementFilter,
		setRightElementFilter,
		rightRarityFilter,
		setRightRarityFilter,
	} = useBanPickFilters();
	const [turnRemainingSeconds, setTurnRemainingSeconds] = useState(
		TURN_DURATION_SECONDS,
	);
	const [pendingCharacter, setPendingCharacter] =
		useState<AccountCharacterResponse | null>(null);
	const [isSubmittingTurnAction, setIsSubmittingTurnAction] = useState(false);
	const [pageMatchState, setPageMatchState] = useState<
		MatchStateResponse | undefined
	>(matchState);
	const [sessionCost, setSessionCost] = useState<SessionCostResponse | null>(
		null,
	);
	const [
		blueSelectedWeaponRefinementByCharacterId,
		setBlueSelectedWeaponRefinementByCharacterId,
	] = useState<Record<string, number | undefined>>({});
	const [
		redSelectedWeaponRefinementByCharacterId,
		setRedSelectedWeaponRefinementByCharacterId,
	] = useState<Record<string, number | undefined>>({});
	const autoResolvedStepRef = useRef<number | null>(null);
	const lastCalculatedTurnRef = useRef<string | null>(null);
	const sessionRecordInputRef = useRef<SaveSessionRecordInput>(
		EMPTY_SESSION_RECORD_INPUT,
	);

	const triggerDebouncedSaveSessionRecord = useDebounce(
		(matchSessionId: number, recordInput: SaveSessionRecordInput) => {
			void sessionRecordApi
				.saveSessionRecord(matchSessionId, recordInput)
				.catch(() => {
					// Session record autosave should not interrupt match flow.
				});
		},
		5000,
	);

	const onTimerValuesChange = useCallback(
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
							redFinalTime: values.chamber1 + values.chamber2 + values.chamber3,
						};

			sessionRecordInputRef.current = nextRecordInput;

			const matchSessionId = Number(pageMatchState?.currentSession);
			if (!Number.isInteger(matchSessionId) || matchSessionId <= 0) {
				return;
			}

			triggerDebouncedSaveSessionRecord(matchSessionId, nextRecordInput);
		},
		[pageMatchState?.currentSession, triggerDebouncedSaveSessionRecord],
	);

	useSocketEvent(SocketEvent.UPDATE_MATCH_STATE, (data: MatchStateResponse) => {
		setPageMatchState(data);
	});

	useSocketEvent(SocketEvent.MATCH_UPDATED, (data: any) => {
		if (data.status === MatchStatus.COMPLETED) {
			void router.navigate({
				to: "/room/$roomId/result",
				params: { roomId: match?.id ?? "" },
			});
		} else {
			void router.invalidate();
		}
	});

	const { blueCharacters, redCharacters, weapons } = useBanPickQueries({
		bluePlayerId: bluePlayer?.id,
		redPlayerId: redPlayer?.id,
	});
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
			const response = await sessionCostApi.calculateSessionCost(
				matchSessionId,
				{
					characterId: Number(character.id),
					activatedConstellation: character.constellation,
					characterLevel: character.level,
					weaponId,
					weaponRefinement,
					weaponRarity: pickedWeapon?.rarity,
					side: PlayerSide.BLUE,
				},
			);

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
			const response = await sessionCostApi.calculateSessionCost(
				matchSessionId,
				{
					characterId: Number(character.id),
					activatedConstellation: character.constellation,
					characterLevel: character.level,
					weaponId,
					weaponRefinement,
					weaponRarity: pickedWeapon?.rarity,
					side: PlayerSide.RED,
				},
			);

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
				const response = await sessionCostApi.calculateSessionCost(
					matchSessionId,
					{
						characterId: latestCharacter.characterId,
						activatedConstellation: latestCharacter.activatedConstellation,
						characterLevel: latestCharacter.characterLevel,
						weaponId: selectedWeapon?.id,
						weaponRefinement:
							selectedWeaponRefinement ?? (selectedWeapon ? 1 : undefined),
						weaponRarity: selectedWeapon?.rarity,
						side: mapDraftSideToPlayerSide(latestAction.side),
						currentTurn: completedTurn,
					},
				);

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

	const handleSubmit = async () => {
		if (isDraftCompleted) {
			if (profile?.id !== match?.host?.id) return;
			if (!pageMatchState) {
				toast.error(
					"Match state is unavailable. Please refresh and try again.",
				);
				return;
			}

			const record = sessionRecordInputRef.current;
			const sessionValidationErrors = validateSessionCompletionData(
				pageMatchState,
				record,
			);
			if (sessionValidationErrors.length > 0) {
				toast.error(
					sessionValidationErrors[0] ?? "Session data is incomplete.",
				);
				return;
			}

			try {
				setIsSubmittingTurnAction(true);
				const matchSessionId = Number(pageMatchState?.currentSession);
				if (Number.isInteger(matchSessionId) && matchSessionId > 0) {
					await sessionRecordApi.saveSessionRecord(matchSessionId, record);
				}
				if (match?.id) await matchApi.completeSession(match.id);
				toast.success("Session completed");
				if (match?.id) {
					void router.navigate({
						to: "/room/$roomId/result",
						params: { roomId: match.id },
					});
				}
			} catch {
				toast.error("Failed to complete session");
			} finally {
				setIsSubmittingTurnAction(false);
			}

			return;
		}

		await onConfirmCharacter();
	};

	return (
		<>
			<div className="min-h-screen max-w-screen overflow-hidden">
				<div className="grid grid-cols-7 h-dvh gap-4">
					<BanPickSideSection
						side="blue"
						player={bluePlayer}
						cost={blueSideCost}
						isRealtimeMatch={isRealtimeMatch}
						onTimerValuesChange={onTimerValuesChange}
						bans={blueBanPickBans}
						picks={blueBanPickPicks}
						currentAction={currentAction}
						isDraftCompleted={isDraftCompleted}
						pendingCharacter={pendingBanPickCharacter}
						canInteract={isCurrentUserTurn}
						search={leftSearch}
						onSearchChange={setLeftSearch}
						selectedElement={leftElementFilter}
						onSelectElement={setLeftElementFilter}
						selectedRarity={leftRarityFilter}
						onSelectRarity={setLeftRarityFilter}
						characters={leftFilteredBanPickCharacters}
						selectedCharacterNames={selectedCharacterNames}
						filteredCharacters={leftFilteredCharacters}
						onSelectCharacter={onSelectCharacter}
						weapons={weapons}
						canReorderTeam={canReorderBlueTeam}
						canPickWeapon={profile?.id === bluePlayer?.id}
						disabledWeaponIds={
							profile?.id === bluePlayer?.id ? blueDisabledWeaponIds : undefined
						}
						selectedWeaponByCharacterId={blueSelectedWeaponByCharacterId}
						onPickWeapon={onPickBlueWeapon}
					/>

					<BanPickActionPanel
						formattedTurnCountdown={formattedTurnCountdown}
						isDraftCompleted={isDraftCompleted}
						draftStep={draftStep}
						draftSequenceLength={DRAFT_SEQUENCE.length}
						currentAction={currentAction}
						isSubmittingTurnAction={isSubmittingTurnAction}
						isButtonDisabled={
							isSubmittingTurnAction ||
							(isDraftCompleted
								? profile?.id !== match?.host?.id
								: !isCurrentUserTurn || !pendingCharacter)
						}
						onSubmit={handleSubmit}
					/>

					<BanPickSideSection
						side="red"
						player={redPlayer}
						cost={redSideCost}
						isRealtimeMatch={isRealtimeMatch}
						onTimerValuesChange={onTimerValuesChange}
						bans={redBanPickBans}
						picks={redBanPickPicks}
						currentAction={currentAction}
						isDraftCompleted={isDraftCompleted}
						pendingCharacter={pendingBanPickCharacter}
						canInteract={isCurrentUserTurn}
						search={rightSearch}
						onSearchChange={setRightSearch}
						selectedElement={rightElementFilter}
						onSelectElement={setRightElementFilter}
						selectedRarity={rightRarityFilter}
						onSelectRarity={setRightRarityFilter}
						characters={rightFilteredBanPickCharacters}
						selectedCharacterNames={selectedCharacterNames}
						filteredCharacters={rightFilteredCharacters}
						onSelectCharacter={onSelectCharacter}
						weapons={weapons}
						canReorderTeam={canReorderRedTeam}
						canPickWeapon={profile?.id === redPlayer?.id}
						disabledWeaponIds={
							profile?.id === redPlayer?.id ? redDisabledWeaponIds : undefined
						}
						selectedWeaponByCharacterId={redSelectedWeaponByCharacterId}
						onPickWeapon={onPickRedWeapon}
					/>
				</div>
			</div>
		</>
	);
}
