import type { AccountCharacterResponse } from "@/apis/account-characters/types";
import type { UserWeaponResponse } from "@/apis/user-weapons/types";
import BanPickCharacterSelector from "@/components/match/ban-pick-character-selector";
import BanPickDraftSlots from "@/components/match/ban-pick-draft-slots";
import BanPickElementFilter from "@/components/match/ban-pick-element-filter";
import BanPickPlayerInfo from "@/components/match/ban-pick-player-info";
import BanPickRarityFilter from "@/components/match/ban-pick-rarity-filter";
import BanPickTeamBuild from "@/components/match/ban-pick-team-build";
// Timer inputs intentionally removed from side section (host chooses winner)
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import SearchSelect from "@/components/search-select";
import { matchLocaleKeys } from "@/i18n/keys";
import type {
	BanPickCharacter,
	DraftAction,
	DraftSide,
} from "@/components/match/ban-pick.types";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import type { BanPickTimerInputValues } from "@/components/match/ban-pick-timer-inputs";
import { ArrowRightLeft } from "lucide-react";
import supachaiIcon from "@/assets/image/supachai.png";
import { cn } from "@/lib/utils";

interface BanPickSideCostInfo {
	totalCost?: number;
	milestoneCost?: number;
	constellationCost?: number;
	refinementCost?: number;
	levelCost?: number;
	timeBonusCost?: number;
}

interface BanPickSidePlayerInfo {
	id?: string;
	displayName?: string;
	ingameUuid?: string;
	avatar?: string;
}

interface BanPickSideSectionProps {
	side: DraftSide;
	player?: BanPickSidePlayerInfo;
	cost: BanPickSideCostInfo;
	isRealtimeMatch: boolean;
	timerValues: BanPickTimerInputValues;
	onTimerValuesChange: (
		side: DraftSide,
		values: BanPickTimerInputValues,
	) => void;
	bans: (BanPickCharacter | null)[];
	picks: (BanPickCharacter | null)[];
	currentAction?: DraftAction;
	isDraftCompleted: boolean;
	canManageCompletedSession: boolean;
	pendingCharacter: BanPickCharacter | null;
	canInteract: boolean;
	search: string;
	onSearchChange: (value: string) => void;
	selectedElement: string;
	onSelectElement: (value: string) => void;
	selectedRarity: string;
	onSelectRarity: (value: string) => void;
	characters: BanPickCharacter[];
	disabledCharacterIds: Set<string>;
	usedCharacterIds: Set<string>;
	pickedCharacterIds: Set<string>;
	filteredCharacters: AccountCharacterResponse[];
	onSelectCharacter: (character: AccountCharacterResponse) => void;
	weapons: UserWeaponResponse[];
	canReorderTeam: boolean;
	canPickWeapon: boolean;
	selectedWeaponByCharacterId: Record<string, number | undefined>;
	selectedWeaponRefinementByCharacterId: Record<string, number | undefined>;
	onPickWeapon: (
		character: BanPickCharacter,
		weaponId: number,
		weaponRefinement: number,
	) => Promise<void>;
	supachaiRemainingUses: number;
	supachaiPickOptions: (BanPickCharacter | null)[];
	supachaiReplacementOptions: BanPickCharacter[];
	supachaiFromCharacterId: string;
	supachaiToCharacterId: string;
	onSupachaiFromCharacterIdChange: (value: string) => void;
	onSupachaiToCharacterIdChange: (value: string) => void;
	onActivateSupachai: () => Promise<void>;
	isActivatingSupachai: boolean;
	isSupachaiButtonDisabled: boolean;
	hasTravellerPicked?: boolean;
}

export default function BanPickSideSection({
	side,
	player,
	cost,
	isRealtimeMatch,
	timerValues,
	onTimerValuesChange,
	bans,
	picks,
	currentAction,
	isDraftCompleted,
	canManageCompletedSession,
	pendingCharacter,
	canInteract,
	search,
	onSearchChange,
	selectedElement,
	onSelectElement,
	selectedRarity,
	onSelectRarity,
	characters,
	disabledCharacterIds,
	usedCharacterIds,
	pickedCharacterIds,
	filteredCharacters,
	onSelectCharacter,
	weapons,
	canReorderTeam,
	canPickWeapon,
	selectedWeaponByCharacterId,
	selectedWeaponRefinementByCharacterId,
	onPickWeapon,
	supachaiRemainingUses,
	supachaiPickOptions,
	supachaiReplacementOptions,
	supachaiFromCharacterId,
	supachaiToCharacterId,
	onSupachaiFromCharacterIdChange,
	onSupachaiToCharacterIdChange,
	onActivateSupachai,
	isActivatingSupachai,
	isSupachaiButtonDisabled,
	hasTravellerPicked,
}: BanPickSideSectionProps) {
	const { t } = useTranslation("match");
	void isRealtimeMatch;
	void timerValues;
	void onTimerValuesChange;
	const [isSupachaiDialogOpen, setIsSupachaiDialogOpen] = useState(false);
	const [isSupachaiWarningOpen, setIsSupachaiWarningOpen] = useState(false);
	const isBlue = side === "blue";
	const backgroundClassName = isBlue
		? "bg-transparent bg-radial from-sky-400/50 from-0% to-white/0 to-70% fixed inset-0 z-[-2] left-[-500px] top-0 h-screen aspect-square rounded-full"
		: "bg-transparent bg-radial from-red-400/50 from-0% to-white/0 to-70% fixed inset-0 z-[-2] left-[1500px] top-0 h-screen aspect-square rounded-full";
	// Show supachai controls if draft completed and either side player can pick weapons
	// or the parent explicitly allowed management for this side (host-as-player for that side)
	const canShowSupachaiControls = isDraftCompleted && (canPickWeapon || canManageCompletedSession);
	const isSupachaiUsedThisSession = supachaiRemainingUses <= 0;

	const supachaiTargetCharacter = useMemo(
		() => supachaiPickOptions.find((character) => character?.id === supachaiFromCharacterId) ?? null,
		[supachaiFromCharacterId, supachaiPickOptions],
	);

	const supachaiReplacementCharacter = useMemo(
		() => supachaiReplacementOptions.find((character) => character.id === supachaiToCharacterId) ?? null,
		[supachaiReplacementOptions, supachaiToCharacterId],
	);

	const supachaiPickSearchOptions = useMemo(
		() =>
			supachaiPickOptions.map((character, index) => {
				if (!character) return null;
				return {
					value: character.id,
					label: `${t(matchLocaleKeys.ban_pick_supachai_pick_label, {
						index: index + 1,
					})}: ${character.name}`,
				};
			}).filter((opt): opt is NonNullable<typeof opt> => opt !== null),
		[supachaiPickOptions, t],
	);

	const supachaiReplacementSearchOptions = useMemo(
		() =>
			supachaiReplacementOptions.map((character) => {
				if (!character) return null;
				return {
					value: character.id,
					label: character.name,
				};
			}).filter((opt): opt is NonNullable<typeof opt> => opt !== null),
		[supachaiReplacementOptions],
	);

	const getCharacterInitials = (name: string) =>
		name
			.split(" ")
			.filter(Boolean)
			.map((part) => part[0]?.toUpperCase())
			.slice(0, 2)
			.join("") || "?";

	// Debug: Log supachai disabled status
	useEffect(() => {
		console.log(`[Supachai-${side}] Status:`, {
			canShowSupachaiControls,
			isSupachaiButtonDisabled,
			isSupachaiUsedThisSession,
			supachaiRemainingUses,
			isDraftCompleted,
			canPickWeapon,
			canManageCompletedSession,
			isBlue,
			supachaiFromCharacterId,
			supachaiToCharacterId,
			isActivatingSupachai,
			conditions: {
				hasFromCharacter: !!supachaiFromCharacterId,
				hasToCharacter: !!supachaiToCharacterId,
				charactersAreDifferent: supachaiFromCharacterId !== supachaiToCharacterId,
				hasRemainingUses: supachaiRemainingUses > 0,
			},
		});
	}, [
		canShowSupachaiControls,
		isSupachaiButtonDisabled,
		isSupachaiUsedThisSession,
		supachaiRemainingUses,
		isDraftCompleted,
		canPickWeapon,
		canManageCompletedSession,
		isBlue,
		supachaiFromCharacterId,
		supachaiToCharacterId,
		isActivatingSupachai,
		side,
	]);

	const renderCharacterPreview = (character: BanPickCharacter | null) => (
		<div className="flex items-center gap-3 rounded-md border border-white/10 bg-white/5 p-3">
			<Avatar className="size-14 rounded-none">
				<AvatarImage src={character?.imageUrl} alt={character?.name ?? ""} className="rounded-none" />
				<AvatarFallback className="rounded-none">{getCharacterInitials(character?.name ?? "?")}</AvatarFallback>
			</Avatar>
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium">{character?.name ?? "-"}</p>
				<p className="text-xs text-white/60">Cost: {character?.cost ?? ""}</p>
			</div>
		</div>
	);

	return (
		<div className="col-span-3 flex flex-col h-dvh p-4 gap-4">
			<div className={backgroundClassName}></div>

			{/* Timer inputs removed: host will choose winner manually */}

			<div className="grid grid-rows-2 gap-4 h-full overflow-hidden">
				<div className="grid grid-cols-7 gap-8">
					{isBlue ? (
						<>
							<BanPickPlayerInfo side={side} player={player} cost={cost} isBanPickFinished={isDraftCompleted} />
							<BanPickDraftSlots
								side={side}
								bans={bans}
								picks={picks}
								currentAction={currentAction}
								isDraftCompleted={isDraftCompleted}
								pendingCharacter={pendingCharacter}
							/>
						</>
					) : (
						<>
							<BanPickDraftSlots
								side={side}
								bans={bans}
								picks={picks}
								currentAction={currentAction}
								isDraftCompleted={isDraftCompleted}
								pendingCharacter={pendingCharacter}
							/>
							<BanPickPlayerInfo side={side} player={player} cost={cost} isBanPickFinished={isDraftCompleted} />
						</>
					)}
				</div>

				{isDraftCompleted ? (
					<div className="flex h-full flex-col gap-4 overflow-hidden">
						<BanPickTeamBuild
							picks={picks}
							weapons={weapons}
							titleClassName={isBlue ? "text-sky-400" : "text-red-600"}
							slotClassName={
								isBlue
									? "bg-sky-800/10 border-sky-400/50"
									: "bg-red-800/10 border-red-600/50"
							}
							canReorder={canReorderTeam}
							canPickWeapon={canPickWeapon}
							selectedWeaponByCharacterId={selectedWeaponByCharacterId}
							selectedWeaponRefinementByCharacterId={
								selectedWeaponRefinementByCharacterId
							}
							onPickWeapon={onPickWeapon}
						/>

						{canShowSupachaiControls ? (
							<div className={cn(isBlue ? "" : "justify-end", "flex items-center")}>
								<button
									type="button"
									className="w-24 h-auto relative rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
									onClick={() => setIsSupachaiDialogOpen(true)}
									disabled={isSupachaiUsedThisSession || isSupachaiButtonDisabled}
									title={t(matchLocaleKeys.ban_pick_supachai_activate)}
								>
									<img
										src={supachaiIcon}
										alt={t(matchLocaleKeys.ban_pick_supachai_activate)}
										className={cn(
											"w-full h-auto object-contain transition-[filter] duration-200",
											isSupachaiUsedThisSession ? "grayscale" : "",
										)}
									/>
								</button>

								<Dialog
									open={isSupachaiDialogOpen}
									onOpenChange={setIsSupachaiDialogOpen}
								>
									<DialogContent className="sm:max-w-2xl">
										<DialogHeader>
											<DialogTitle>
												{t(matchLocaleKeys.ban_pick_supachai_title)}
											</DialogTitle>
											<DialogDescription>
												{t(matchLocaleKeys.ban_pick_supachai_dialog_description)}
											</DialogDescription>
										</DialogHeader>

										<div className="grid gap-4 md:grid-cols-3">
											<div className="space-y-3">
												<p className="text-xs uppercase tracking-wide text-white/60">
													{t(matchLocaleKeys.ban_pick_supachai_target_slot)}
												</p>
												{renderCharacterPreview(supachaiTargetCharacter)}
												<SearchSelect
													value={supachaiFromCharacterId}
													onValueChange={onSupachaiFromCharacterIdChange}
													options={supachaiPickSearchOptions}
													placeholder={t(matchLocaleKeys.ban_pick_supachai_pick_slot_placeholder)}
													searchPlaceholder={t(matchLocaleKeys.ban_pick_supachai_pick_slot_placeholder)}
													ariaLabel={t(matchLocaleKeys.ban_pick_supachai_target_slot)}
													className="w-full"
													triggerClassName="w-full"
													contentClassName="w-full"
												/>
											</div>

											<div className="space-y-3 flex items-center justify-center">
												<ArrowRightLeft />
											</div>

											<div className="space-y-3">
												<p className="text-xs uppercase tracking-wide text-white/60">
													{t(matchLocaleKeys.ban_pick_supachai_replacement)}
												</p>
												{renderCharacterPreview(supachaiReplacementCharacter)}
												<SearchSelect
													value={supachaiToCharacterId}
													onValueChange={onSupachaiToCharacterIdChange}
													options={supachaiReplacementSearchOptions}
													placeholder={t(matchLocaleKeys.ban_pick_supachai_replacement_placeholder)}
													searchPlaceholder={t(matchLocaleKeys.ban_pick_supachai_replacement_placeholder)}
													emptyText={t(matchLocaleKeys.ban_pick_supachai_no_replacement)}
													ariaLabel={t(matchLocaleKeys.ban_pick_supachai_replacement)}
													className="w-full"
													triggerClassName="w-full"
													contentClassName="w-full"
												/>
											</div>
										</div>

										<DialogFooter>
											<Button
												type="button"
												variant="outline"
												onClick={() => setIsSupachaiDialogOpen(false)}
											>
												{t(matchLocaleKeys.ban_pick_cancel)}
											</Button>
											<Button
												type="button"
												disabled={
													!supachaiFromCharacterId ||
													!supachaiToCharacterId ||
													supachaiFromCharacterId === supachaiToCharacterId ||
													supachaiRemainingUses <= 0
												}
												onClick={() => {
													setIsSupachaiDialogOpen(false);
													setIsSupachaiWarningOpen(true);
												}}
											>
												{t(matchLocaleKeys.ban_pick_confirm)}
											</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>

								<Dialog
									open={isSupachaiWarningOpen}
									onOpenChange={setIsSupachaiWarningOpen}
								>
									<DialogContent className="sm:max-w-xl">
										<DialogHeader>
											<DialogTitle>
												{t(matchLocaleKeys.ban_pick_supachai_warning_title)}
											</DialogTitle>
											<DialogDescription>
												{t(matchLocaleKeys.ban_pick_supachai_warning_description)}
											</DialogDescription>
										</DialogHeader>

										<div className="grid gap-3 md:grid-cols-2">
											{renderCharacterPreview(supachaiTargetCharacter)}
											{renderCharacterPreview(supachaiReplacementCharacter)}
										</div>

										<DialogFooter>
											<Button
												type="button"
												variant="outline"
												onClick={() => setIsSupachaiWarningOpen(false)}
											>
												{t(matchLocaleKeys.ban_pick_supachai_warning_back)}
											</Button>
											<Button
												type="button"
												disabled={isActivatingSupachai}
												onClick={async () => {
													await onActivateSupachai();
													setIsSupachaiWarningOpen(false);
												}}
											>
												{isActivatingSupachai
													? t(matchLocaleKeys.ban_pick_supachai_activating)
													: t(matchLocaleKeys.ban_pick_supachai_warning_confirm)}
											</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>
							</div>
						) : null}
					</div>
				) : (
					<BanPickCharacterSelector
						side={side}
						canInteract={canInteract}
						showCharacterDetails={canPickWeapon}
						search={search}
						onSearchChange={onSearchChange}
						renderElementFilter={
							<BanPickElementFilter
								selectedElement={selectedElement}
								onSelect={onSelectElement}
							/>
						}
						renderRarityFilter={
							<BanPickRarityFilter
								selectedRarity={selectedRarity}
								onSelect={onSelectRarity}
							/>
						}
						characters={characters}
						disabledCharacterIds={disabledCharacterIds}
						usedCharacterIds={usedCharacterIds}
						pickedCharacterIds={pickedCharacterIds}
						pendingCharacter={pendingCharacter}
						isDraftCompleted={isDraftCompleted}
						currentAction={currentAction}
						hasTravellerPicked={hasTravellerPicked}
						onSelectCharacter={(character) => {
							const selected = filteredCharacters.find(
								(item) => item.characters.name === character.name,
							);
							if (selected) {
								onSelectCharacter(selected);
								return;
							}
							// Viewer may not have the opponent's account roster loaded. In that
							// case, construct a minimal fallback containing `characterId` so the
							// caller can derive the correct character id to send to the API.
							const fallback = { characterId: Number(character.id) } as unknown as AccountCharacterResponse;
							onSelectCharacter(fallback);
						}}
					/>
				)}
			</div>
		</div>
	);
}
