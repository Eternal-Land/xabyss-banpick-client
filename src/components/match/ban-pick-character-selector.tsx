import CharacterContainer from '@/components/player-side/character-container'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type {
    BanPickCharacter,
    DraftAction,
    DraftSide,
} from '@/components/match/ban-pick.types'

export interface BanPickCharacterSelectorProps {
    side: DraftSide
    search: string
    onSearchChange: (value: string) => void
    renderElementFilter: React.ReactNode
    renderRarityFilter: React.ReactNode
    characters: BanPickCharacter[]
    selectedCharacterNames: Set<string>
    pendingCharacter: BanPickCharacter | null
    isDraftCompleted: boolean
    currentAction?: DraftAction
    onSelectCharacter: (character: BanPickCharacter) => void
}

export default function BanPickCharacterSelector({
    side,
    search,
    onSearchChange,
    renderElementFilter,
    renderRarityFilter,
    characters,
    selectedCharacterNames,
    pendingCharacter,
    isDraftCompleted,
    currentAction,
    onSelectCharacter,
}: BanPickCharacterSelectorProps) {
    const activeRingClass =
        side === 'blue'
            ? 'rounded-sm ring-2 ring-sky-400 ring-offset-2 ring-offset-transparent'
            : 'rounded-sm ring-2 ring-red-600 ring-offset-2 ring-offset-transparent'

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex items-center justify-between gap-2">
                <Input
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Search character..."
                    className="w-1/3"
                />
                {renderElementFilter}
                {renderRarityFilter}
            </div>
            <div className="grid grid-cols-7 auto-rows-min gap-4 overflow-y-auto p-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {characters.map((character, index) => {
                    const isSelectedInDraft = selectedCharacterNames.has(character.name)
                    const isDisabled =
                        isDraftCompleted ||
                        currentAction?.side !== side ||
                        isSelectedInDraft

                    return (
                        <button
                            key={`${character.name}-${index}`}
                            type="button"
                            onClick={() => onSelectCharacter(character)}
                            disabled={isDisabled}
                            className={cn(
                                'text-left',
                                pendingCharacter?.name === character.name && activeRingClass,
                                isDisabled
                                    ? 'cursor-not-allowed opacity-60 grayscale'
                                    : 'cursor-pointer',
                            )}
                        >
                            <CharacterContainer
                                constellation={character.constellation}
                                element={character.element}
                                imageUrl={character.imageUrl}
                                level={character.level}
                                name={character.name}
                                rarity={character.rarity}
                            />
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
