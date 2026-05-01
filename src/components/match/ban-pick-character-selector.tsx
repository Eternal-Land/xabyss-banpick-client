import CharacterContainer from "@/components/player-side/character-container";
import { Input } from "@/components/ui/input";
import { matchLocaleKeys } from "@/i18n/keys";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import type {
	BanPickCharacter,
	DraftAction,
	DraftSide,
} from "@/components/match/ban-pick.types";

export interface BanPickCharacterSelectorProps {
	side: DraftSide;
	canInteract: boolean;
	showCharacterDetails: boolean;
	search: string;
	onSearchChange: (value: string) => void;
	renderElementFilter: React.ReactNode;
	renderRarityFilter: React.ReactNode;
	characters: BanPickCharacter[];
	disabledCharacterIds: Set<string>;
	usedCharacterIds: Set<string>;
	pickedCharacterIds: Set<string>;
	pendingCharacter: BanPickCharacter | null;
	isDraftCompleted: boolean;
	currentAction?: DraftAction;
	hasTravellerPicked?: boolean;
	onSelectCharacter: (character: BanPickCharacter) => void;
}

export default function BanPickCharacterSelector({
	side,
	canInteract,
	showCharacterDetails,
	search,
	onSearchChange,
	renderElementFilter,
	renderRarityFilter,
	characters,
	disabledCharacterIds,
	usedCharacterIds,
	pickedCharacterIds,
	pendingCharacter,
	isDraftCompleted,
	currentAction,
	hasTravellerPicked,
	onSelectCharacter,
}: BanPickCharacterSelectorProps) {
	const { t } = useTranslation("match");
	const activeRingClass =
		side === "blue"
			? "rounded-sm ring-2 ring-sky-400 ring-offset-2 ring-offset-transparent"
			: "rounded-sm ring-2 ring-red-600 ring-offset-2 ring-offset-transparent";

	// During ban turn, the acting side bans a character from the opponent.
	// So make the selectable side the opposite side for ban actions.
	const selectableSide = currentAction
		? currentAction.type === "ban"
			? currentAction.side === "blue"
				? "red"
				: "blue"
			: currentAction.side
		: undefined;

	return (
		<div className="flex flex-col gap-4 h-full">
			<div className="flex items-center justify-between gap-2">
				<Input
					value={search}
					onChange={(event) => onSearchChange(event.target.value)}
					placeholder={t(matchLocaleKeys.ban_pick_search_character_placeholder)}
					className="w-1/3"
				/>
				{renderElementFilter}
				{renderRarityFilter}
			</div>
			<div className="grid grid-cols-7 auto-rows-min gap-4 overflow-y-auto p-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
				{characters.map((character, index) => {
					const isDisabledByCharacter = disabledCharacterIds.has(character.id);
					const isUsedByPreviousSessions = usedCharacterIds.has(character.id);
					const isSidePick = pickedCharacterIds.has(character.id);
					const isTraveller = character.name.toLowerCase().startsWith("traveller");
					const isDisabled =
						isDraftCompleted ||
						!canInteract ||
						selectableSide !== side ||
						isDisabledByCharacter ||
						(isTraveller && hasTravellerPicked && currentAction?.type === "pick");

					return (
						<button
							key={`${character.name}-${index}`}
							type="button"
							onClick={() => onSelectCharacter(character)}
							disabled={isDisabled}
							className={cn(
								"text-left flex flex-col items-center gap-2",
								pendingCharacter?.name === character.name && activeRingClass,
								isDisabled
									? "cursor-not-allowed"
									: "cursor-pointer",
							isDisabledByCharacter
								? "grayscale"
								: "",
							isDisabledByCharacter && isSidePick
								? side === "blue"
									? "opacity-75 ring-1 ring-sky-400/60"
									: "opacity-75 ring-1 ring-red-600/60"
								: "",
							isDisabled && !isDisabledByCharacter && !isUsedByPreviousSessions
								? "opacity-60"
									: "",
							)}
						>
							<CharacterContainer
								constellation={character.constellation}
								element={character.element}
								imageUrl={character.imageUrl}
								level={character.level}
								name={character.name}
								rarity={character.rarity}
								showLevel={showCharacterDetails}
								showConstellation={showCharacterDetails}
							/>
							{showCharacterDetails ? (
								<span>
									{t(matchLocaleKeys.ban_pick_cost_label)}: {character.cost}
								</span>
							) : null}
						</button>
					);
				})}
			</div>
		</div>
	);
}
