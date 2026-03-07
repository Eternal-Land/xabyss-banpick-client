import BanPickCharacterSelector from '@/components/match/ban-pick-character-selector'
import BanPickDraftSlots from '@/components/match/ban-pick-draft-slots'
import BanPickTeamBuild from '@/components/match/ban-pick-team-build'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type {
    BanPickCharacter,
    DraftAction,
    DraftState,
} from '@/components/match/ban-pick.types'
import {
    CharacterElement,
    CharacterElementDetail,
    type CharacterElementEnum,
} from '@/lib/constants'
import { cn } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_userLayout/room/$roomId/ban-pick')({
    component: RouteComponent,
})

const SAMPLE_PLAYER = {
    name: 'Shirogane Toru',
    uid: '123456789',
    avatar:
        'https://res.cloudinary.com/dphtvhtvf/image/upload/v1770611732/genshin-impact-banpick/upload/avatars/euhhui4znfpssjw8laps.jpg',
}

const ELEMENT_FILTER_ALL = 'all'
const RARITY_FILTER_ALL = 'all'

const ELEMENT_OPTIONS = Object.values(CharacterElement) as CharacterElementEnum[]

const SAMPLE_CHARACTERS: BanPickCharacter[] = Array.from(
    { length: 50 },
    (_, index) => ({
        name: `Character ${index + 1}`,
        imageUrl:
            'https://res.cloudinary.com/dphtvhtvf/image/upload/v1768877319/raiden-shogun_lxknci.png',
        rarity: index % 2 === 0 ? 5 : 4,
        level: 80 + (index % 21),
        constellation: index % 7,
        element: ELEMENT_OPTIONS[index % ELEMENT_OPTIONS.length],
    }),
)

const MOCK_DRAFT_SEQUENCE: DraftAction[] = [
    { side: 'blue', type: 'ban' },
    { side: 'red', type: 'ban' },
    { side: 'blue', type: 'ban' },
    { side: 'red', type: 'ban' },
    { side: 'blue', type: 'pick' },
    { side: 'red', type: 'pick' },
    { side: 'red', type: 'pick' },
    { side: 'blue', type: 'pick' },
    { side: 'blue', type: 'pick' },
    { side: 'red', type: 'pick' },
    { side: 'red', type: 'pick' },
    { side: 'blue', type: 'pick' },
    { side: 'red', type: 'ban' },
    { side: 'blue', type: 'ban' },
    { side: 'red', type: 'pick' },
    { side: 'blue', type: 'pick' },
    { side: 'blue', type: 'pick' },
    { side: 'red', type: 'pick' },
    { side: 'red', type: 'pick' },
    { side: 'blue', type: 'pick' },
    { side: 'blue', type: 'pick' },
    { side: 'red', type: 'pick' },
]

const INITIAL_DRAFT_STATE: DraftState = {
    blue: { bans: [], picks: [] },
    red: { bans: [], picks: [] },
}

function filterCharacters(
    characters: BanPickCharacter[],
    search: string,
    elementFilter: string,
    rarityFilter: string,
) {
    const normalizedSearch = search.trim().toLowerCase()

    return characters.filter((character) => {
        const matchesSearch =
            !normalizedSearch ||
            character.name.toLowerCase().includes(normalizedSearch)

        const matchesElement =
            elementFilter === ELEMENT_FILTER_ALL ||
            CharacterElementDetail[character.element].key === elementFilter

        const matchesRarity =
            rarityFilter === RARITY_FILTER_ALL ||
            character.rarity.toString() === rarityFilter

        return matchesSearch && matchesElement && matchesRarity
    })
}

function RouteComponent() {
    const [leftSearch, setLeftSearch] = useState('')
    const [rightSearch, setRightSearch] = useState('')
    const [leftElementFilter, setLeftElementFilter] = useState(ELEMENT_FILTER_ALL)
    const [leftRarityFilter, setLeftRarityFilter] = useState(RARITY_FILTER_ALL)

    const [rightElementFilter, setRightElementFilter] = useState(ELEMENT_FILTER_ALL)
    const [rightRarityFilter, setRightRarityFilter] = useState(RARITY_FILTER_ALL)
    const [draftState, setDraftState] = useState<DraftState>(INITIAL_DRAFT_STATE)
    const [draftStep, setDraftStep] = useState(0)
    const [pendingCharacter, setPendingCharacter] =
        useState<BanPickCharacter | null>(null)

    const selectedCharacterNames = useMemo(() => {
        const selected = new Set<string>()

            ;[
                ...draftState.blue.bans,
                ...draftState.blue.picks,
                ...draftState.red.bans,
                ...draftState.red.picks,
            ].forEach((character) => selected.add(character.name))

        return selected
    }, [draftState])

    const leftFilteredCharacters = useMemo(
        () =>
            filterCharacters(
                SAMPLE_CHARACTERS,
                leftSearch,
                leftElementFilter,
                leftRarityFilter,
            ),
        [leftSearch, leftElementFilter, leftRarityFilter],
    )

    const rightFilteredCharacters = useMemo(
        () =>
            filterCharacters(
                SAMPLE_CHARACTERS,
                rightSearch,
                rightElementFilter,
                rightRarityFilter,
            ),
        [rightSearch, rightElementFilter, rightRarityFilter],
    )

    const currentAction =
        draftStep < MOCK_DRAFT_SEQUENCE.length
            ? MOCK_DRAFT_SEQUENCE[draftStep]
            : undefined

    const isDraftCompleted = draftStep >= MOCK_DRAFT_SEQUENCE.length

    const onSelectCharacter = (character: BanPickCharacter) => {
        if (!currentAction || selectedCharacterNames.has(character.name)) {
            return
        }

        setPendingCharacter(character)
    }

    const onConfirmCharacter = () => {
        if (
            !currentAction ||
            !pendingCharacter ||
            selectedCharacterNames.has(pendingCharacter.name)
        ) {
            return
        }

        setDraftState((prevState) => {
            const nextState: DraftState = {
                blue: {
                    bans: [...prevState.blue.bans],
                    picks: [...prevState.blue.picks],
                },
                red: {
                    bans: [...prevState.red.bans],
                    picks: [...prevState.red.picks],
                },
            }

            const target = nextState[currentAction.side]

            if (currentAction.type === 'ban') {
                target.bans.push(pendingCharacter)
            } else {
                target.picks.push(pendingCharacter)
            }

            return nextState
        })

        setDraftStep((prevStep) => prevStep + 1)
        setPendingCharacter(null)
    }

    const onResetDraft = () => {
        setDraftState(INITIAL_DRAFT_STATE)
        setDraftStep(0)
        setPendingCharacter(null)
    }


    const renderElementFilter = (
        selectedElement: string,
        onSelect: (value: string) => void,
    ) => (
        <div className="flex flex-wrap items-center gap-2">
            <button
                type="button"
                onClick={() => onSelect(ELEMENT_FILTER_ALL)}
                className={cn(
                    'h-8 rounded-md border px-2 text-xs transition-colors',
                    selectedElement === ELEMENT_FILTER_ALL
                        ? 'border-white bg-white/20 text-white'
                        : 'border-white/30 text-white/80 hover:bg-white/10',
                )}
            >
                All
            </button>
            {ELEMENT_OPTIONS.map((element) => {
                const detail = CharacterElementDetail[element]
                const isActive = selectedElement === detail.key

                return (
                    <button
                        key={detail.key}
                        type="button"
                        onClick={() => onSelect(detail.key)}
                        className={cn(
                            'h-8 w-8 rounded-md border p-1 transition-colors',
                            isActive
                                ? 'border-white bg-white/20'
                                : 'border-white/30 hover:bg-white/10',
                        )}
                        title={detail.name}
                        aria-label={detail.name}
                    >
                        <img
                            src={detail.iconUrl}
                            alt={detail.name}
                            className="h-full w-full object-contain"
                        />
                    </button>
                )
            })}
        </div>
    )

    const renderRarityFilter = (
        selectedRarity: string,
        onSelect: (value: string) => void,
    ) => (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={() => onSelect(RARITY_FILTER_ALL)}
                className={cn(
                    'h-8 rounded-md border px-2 text-xs transition-colors',
                    selectedRarity === RARITY_FILTER_ALL
                        ? 'border-white bg-white/20 text-white'
                        : 'border-white/30 text-white/80 hover:bg-white/10',
                )}
            >
                All
            </button>

            {[5, 4].map((rarity) => {
                const value = rarity.toString()
                const isActive = selectedRarity === value

                return (
                    <button
                        key={value}
                        type="button"
                        onClick={() => onSelect(value)}
                        className={cn(
                            'h-8 rounded-md border px-2 text-xs transition-colors flex items-center gap-1',
                            isActive
                                ? 'border-sky-400 bg-sky-400/15 text-sky-300'
                                : 'border-white/30 text-white/80 hover:bg-white/10',
                        )}
                        aria-label={`${rarity} star`}
                    >
                        <Star className={cn("h-3.5 w-3.5 fill-current", rarity === 5 ? "text-orange-400" : "text-purple-600")} />
                    </button>
                )
            })}
        </div>
    )

    return (
        <>
            <div className="min-h-screen max-w-screen overflow-hidden">
                <div className="grid grid-cols-7 h-dvh gap-4">
                    <div className="col-span-3 flex flex-col h-dvh p-4 gap-4">
                        {/* Background blue side */}
                        <div className="bg-transparent bg-radial from-sky-400/50 from-0% to-white/0 to-70% fixed inset-0 z-[-2] left-[-500px] top-0 h-screen aspect-square rounded-full"></div>

                        {/* Timer */}
                        <div className="timer-side flex items-center gap-4">
                            <Field>
                                <FieldLabel>Chamber 1</FieldLabel>
                                <Input placeholder="00:00" />
                            </Field>
                            <Field>
                                <FieldLabel>Chamber 2</FieldLabel>
                                <Input placeholder="00:00" />
                            </Field>
                            <Field>
                                <FieldLabel>Chamber 3</FieldLabel>
                                <Input placeholder="00:00" />
                            </Field>
                            <Field>
                                <FieldLabel>Reset</FieldLabel>
                                <Input placeholder="00" />
                            </Field>
                        </div>

                        <div className="grid grid-rows-2 gap-4 h-full overflow-hidden">
                            <div className="grid grid-cols-7 gap-8">
                                <div className="col-span-3 flex flex-col items-center gap-4">
                                    <div className="flex h-full justify-center items-center gap-4">
                                        <div className="w-20 h-20 rounded-full object-cover mt-4 flex items-center justify-center overflow-hidden">
                                            <img src={SAMPLE_PLAYER.avatar} alt="Blue Player Avatar" className="w-full h-full" />
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="text-xl mt-2 text-sky-400">{SAMPLE_PLAYER.name}</span>
                                            <span className="text-sm mt-2">UID: {SAMPLE_PLAYER.uid}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col bg-transparent bg-linear-45 from-white/5 to-white/10 backdrop-blur-md rounded-lg p-4 w-full items-center gap-2 justify-center border border-white">
                                        <div className="flex justify-between items-center gap-4 w-full">
                                            <h1 className="text-lg">Total cost: </h1>
                                            <span className="text-lg font-bold text-sky-400">0</span>
                                        </div>
                                        <div className="flex justify-between items-center gap-4 w-full">
                                            <h1 className="text-lg">Milestone cost: </h1>
                                            <span className="text-lg font-bold text-sky-400">0</span>
                                        </div>
                                        <div className="flex justify-between items-center gap-4 w-full">
                                            <h1 className="text-lg">Constellation: </h1>
                                            <span className="text-lg font-bold text-sky-400">0</span>
                                        </div>
                                        <div className="flex justify-between items-center gap-4 w-full">
                                            <h1 className="text-lg">Refinement: </h1>
                                            <span className="text-lg font-bold text-sky-400">0</span>
                                        </div>
                                        <div className="flex justify-between items-center gap-4 w-full">
                                            <h1 className="text-lg">Level: </h1>
                                            <span className="text-lg font-bold text-sky-400">0</span>
                                        </div>
                                        <div className="flex justify-between items-center gap-4 w-full">
                                            <h1 className="text-3xl text-yellow-400">Time bonus: </h1>
                                            <span className="text-3xl font-bold text-yellow-400">0</span>
                                        </div>
                                    </div>
                                </div>

                                <BanPickDraftSlots
                                    side="blue"
                                    bans={draftState.blue.bans}
                                    picks={draftState.blue.picks}
                                    currentAction={currentAction}
                                    isDraftCompleted={isDraftCompleted}
                                    pendingCharacter={pendingCharacter}
                                />
                            </div>
                            {isDraftCompleted ? (
                                <BanPickTeamBuild
                                    picks={draftState.blue.picks}
                                    titleClassName="text-sky-400"
                                    slotClassName="bg-sky-800/10 border-sky-400/50"
                                />
                            ) : (
                                <BanPickCharacterSelector
                                    side="blue"
                                    search={leftSearch}
                                    onSearchChange={setLeftSearch}
                                    renderElementFilter={renderElementFilter(
                                        leftElementFilter,
                                        setLeftElementFilter,
                                    )}
                                    renderRarityFilter={renderRarityFilter(
                                        leftRarityFilter,
                                        setLeftRarityFilter,
                                    )}
                                    characters={leftFilteredCharacters}
                                    selectedCharacterNames={selectedCharacterNames}
                                    pendingCharacter={pendingCharacter}
                                    isDraftCompleted={isDraftCompleted}
                                    currentAction={currentAction}
                                    onSelectCharacter={onSelectCharacter}
                                />
                            )}

                        </div>
                    </div>

                    <div className="col-span-1 flex flex-col items-center justify-between p-4">
                        <div className="w-full mt-4 rounded-md border border-white/30 bg-white/5 p-3 text-center">
                            <h1 className='text-2xl'>10:00</h1>
                            <p className="mt-3 text-xs text-white/80">
                                {isDraftCompleted
                                    ? 'Draft completed'
                                    : `Step ${draftStep + 1}/${MOCK_DRAFT_SEQUENCE.length}: ${currentAction?.side.toUpperCase()} ${currentAction?.type.toUpperCase()}`}
                            </p>
                            <button
                                type="button"
                                onClick={onResetDraft}
                                className="mt-3 h-8 w-full rounded-md border border-white/40 bg-white/10 text-xs hover:bg-white/20"
                            >
                                Reset mock draft
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
                            <Field>
                                <FieldLabel>Chamber 1</FieldLabel>
                                <Input placeholder="00:00" />
                            </Field>
                            <Field>
                                <FieldLabel>Chamber 2</FieldLabel>
                                <Input placeholder="00:00" />
                            </Field>
                            <Field>
                                <FieldLabel>Chamber 3</FieldLabel>
                                <Input placeholder="00:00" />
                            </Field>
                            <Field>
                                <FieldLabel>Reset</FieldLabel>
                                <Input placeholder="00" />
                            </Field>
                        </div>

                        <div className="grid grid-rows-2 gap-4 h-full overflow-hidden">
                            <div className="grid grid-cols-7 gap-8">
                                <BanPickDraftSlots
                                    side="red"
                                    bans={draftState.red.bans}
                                    picks={draftState.red.picks}
                                    currentAction={currentAction}
                                    isDraftCompleted={isDraftCompleted}
                                    pendingCharacter={pendingCharacter}
                                />

                                <div className="col-span-3 flex flex-col items-center gap-4">
                                    <div className="flex h-full justify-center items-center gap-4">
                                        <div className="flex flex-col items-end">
                                            <span className="text-xl mt-2 text-red-600">{SAMPLE_PLAYER.name}</span>
                                            <span className="text-sm mt-2">UID: {SAMPLE_PLAYER.uid}</span>
                                        </div>

                                        <div className="w-20 h-20 rounded-full object-cover mt-4 flex items-center justify-center overflow-hidden">
                                            <img src={SAMPLE_PLAYER.avatar} alt="Blue Player Avatar" className="w-full h-full" />
                                        </div>


                                    </div>

                                    <div className="flex flex-col bg-transparent bg-linear-45 from-white/5 to-white/10 backdrop-blur-md rounded-lg p-4 w-full items-center gap-2 justify-center border border-white">
                                        <div className="flex justify-between items-center gap-4 w-full">
                                            <h1 className="text-lg">Total cost: </h1>
                                            <span className="text-lg font-bold text-red-600">0</span>
                                        </div>
                                        <div className="flex justify-between items-center gap-4 w-full">
                                            <h1 className="text-lg">Milestone cost: </h1>
                                            <span className="text-lg font-bold text-red-600">0</span>
                                        </div>
                                        <div className="flex justify-between items-center gap-4 w-full">
                                            <h1 className="text-lg">Constellation: </h1>
                                            <span className="text-lg font-bold text-red-600">0</span>
                                        </div>
                                        <div className="flex justify-between items-center gap-4 w-full">
                                            <h1 className="text-lg">Refinement: </h1>
                                            <span className="text-lg font-bold text-red-600">0</span>
                                        </div>
                                        <div className="flex justify-between items-center gap-4 w-full">
                                            <h1 className="text-lg">Level: </h1>
                                            <span className="text-lg font-bold text-red-600">0</span>
                                        </div>
                                        <div className="flex justify-between items-center gap-4 w-full">
                                            <h1 className="text-3xl text-yellow-400">Time bonus: </h1>
                                            <span className="text-3xl font-bold text-yellow-400">0</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {isDraftCompleted ? (
                                <BanPickTeamBuild
                                    picks={draftState.red.picks}
                                    titleClassName="text-red-600"
                                    slotClassName="bg-red-800/10 border-red-600/50"
                                />
                            ) : (
                                <BanPickCharacterSelector
                                    side="red"
                                    search={rightSearch}
                                    onSearchChange={setRightSearch}
                                    renderElementFilter={renderElementFilter(
                                        rightElementFilter,
                                        setRightElementFilter,
                                    )}
                                    renderRarityFilter={renderRarityFilter(
                                        rightRarityFilter,
                                        setRightRarityFilter,
                                    )}
                                    characters={rightFilteredCharacters}
                                    selectedCharacterNames={selectedCharacterNames}
                                    pendingCharacter={pendingCharacter}
                                    isDraftCompleted={isDraftCompleted}
                                    currentAction={currentAction}
                                    onSelectCharacter={onSelectCharacter}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
