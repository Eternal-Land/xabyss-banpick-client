import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { IconAssets } from '@/lib/constants/icon-assets'
import type { BanPickCharacter } from '@/components/match/ban-pick.types'
import { useEffect, useMemo, useState } from 'react'
import type { UserWeaponResponse } from '@/apis/user-weapons/types'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

interface WeaponPickerState {
    characterName: string
    weaponType: BanPickCharacter['weaponType']
}

export interface BanPickTeamBuildProps {
    picks: BanPickCharacter[]
    weapons: UserWeaponResponse[]
    titleClassName: string
    slotClassName: string
    canReorder?: boolean
}

function toFixedTeamSlots(members: BanPickCharacter[]) {
    return Array.from({ length: 8 }).map((_, index) => members[index] ?? null)
}

export default function BanPickTeamBuild({
    picks,
    weapons,
    titleClassName,
    slotClassName,
    canReorder = true,
}: BanPickTeamBuildProps) {
    const [orderedSlots, setOrderedSlots] = useState<Array<BanPickCharacter | null>>(
        () => toFixedTeamSlots(picks),
    )
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
    const [selectedWeaponByCharacterName, setSelectedWeaponByCharacterName] = useState<
        Record<string, number | undefined>
    >({})
    const [weaponPicker, setWeaponPicker] = useState<WeaponPickerState | null>(null)

    const firstHalfOrder = useMemo(() => orderedSlots.slice(0, 4), [orderedSlots])
    const secondHalfOrder = useMemo(() => orderedSlots.slice(4, 8), [orderedSlots])

    useEffect(() => {
        setOrderedSlots(toFixedTeamSlots(picks))
    }, [picks])

    useEffect(() => {
        setSelectedWeaponByCharacterName((prev) => {
            const next: Record<string, number | undefined> = {}
            picks.forEach((character) => {
                next[character.name] = prev[character.name]
            })
            return next
        })
    }, [picks])

    const onSelectWeapon = (characterName: string, weaponId: number) => {
        setSelectedWeaponByCharacterName((prev) => ({
            ...prev,
            [characterName]: weaponId,
        }))
        setWeaponPicker(null)
    }

    const weaponPickerOptions = useMemo(() => {
        if (!weaponPicker) {
            return [] as UserWeaponResponse[]
        }

        return weapons.filter((weapon) => weapon.type === weaponPicker.weaponType)
    }, [weaponPicker, weapons])

    const renderWeaponSlot = (member: BanPickCharacter | null) => {
        if (!member) {
            return <Plus className="h-6 w-6 text-white/80" />
        }

        const selectedWeaponId = selectedWeaponByCharacterName[member.name]
        const selectedWeapon = weapons.find((weapon) => weapon.id === selectedWeaponId)

        return (
            <button
                type="button"
                onClick={() =>
                    setWeaponPicker({
                        characterName: member.name,
                        weaponType: member.weaponType,
                    })
                }
                className="flex h-full w-full items-center justify-center overflow-hidden rounded border border-white/20 bg-white/5 p-1"
            >
                {selectedWeapon?.iconUrl ? (
                    <img
                        src={selectedWeapon.iconUrl}
                        alt={selectedWeapon.name}
                        className="h-full w-full object-contain"
                    />
                ) : (
                    <Plus className="h-6 w-6 text-white/80" />
                )}
            </button>
        )
    }

    const onDropToSlot = (targetIndex: number) => {
        if (!canReorder || draggingIndex === null) {
            return
        }

        if (draggingIndex === targetIndex) {
            setDraggingIndex(null)
            return
        }

        setOrderedSlots((prev) => {
            const next = [...prev]
            const sourceMember = next[draggingIndex]
            next[draggingIndex] = next[targetIndex]
            next[targetIndex] = sourceMember
            return next
        })

        setDraggingIndex(null)
    }

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-white/20 bg-white/5 p-4">
                    <h3
                        className={cn(
                            'mb-3 text-sm font-semibold col-span-3 text-center',
                            titleClassName,
                        )}
                    >
                        First Half
                    </h3>
                    <div className="flex items-center grid grid-cols-4 gap-4">
                        {firstHalfOrder.map((member, index) => {
                            const globalIndex = index

                            return (
                                <div key={`first-half-member-${index}`} className="flex flex-col gap-2">
                                    <div
                                        className={cn(
                                            'w-full h-28 flex items-center justify-center border border-2 overflow-hidden rounded-md',
                                            member && canReorder && 'cursor-move',
                                            slotClassName,
                                        )}
                                        draggable={Boolean(member) && canReorder}
                                        onDragStart={() => {
                                            if (!member || !canReorder) {
                                                return
                                            }

                                            setDraggingIndex(globalIndex)
                                        }}
                                        onDragEnd={() => setDraggingIndex(null)}
                                        onDragOver={(event) => {
                                            if (!canReorder) {
                                                return
                                            }
                                            event.preventDefault()
                                        }}
                                        onDrop={() => onDropToSlot(globalIndex)}
                                    >
                                        {member ? (
                                            <img
                                                src={member.imageUrl}
                                                alt={member.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <img
                                                src={IconAssets.EMPTY_CHARACTER_ICON}
                                                alt="Empty team slot"
                                                className="w-12 h-12 object-contain"
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-col items-center justify-center border border-white/20 border-2 aspect-square">
                                        {renderWeaponSlot(member)}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="rounded-lg border border-white/20 bg-white/5 p-4">
                    <h3
                        className={cn(
                            'mb-3 text-sm font-semibold col-span-3 text-center',
                            titleClassName,
                        )}
                    >
                        Second Half
                    </h3>
                    <div className="flex items-center grid grid-cols-4 gap-4">
                        {secondHalfOrder.map((member, index) => {
                            const globalIndex = index + 4

                            return (
                                <div key={`second-half-member-${index}`} className="flex flex-col gap-2">
                                    <div
                                        className={cn(
                                            'w-full h-28 flex items-center justify-center border border-2 overflow-hidden rounded-md',
                                            member && canReorder && 'cursor-move',
                                            slotClassName,
                                        )}
                                        draggable={Boolean(member) && canReorder}
                                        onDragStart={() => {
                                            if (!member || !canReorder) {
                                                return
                                            }

                                            setDraggingIndex(globalIndex)
                                        }}
                                        onDragEnd={() => setDraggingIndex(null)}
                                        onDragOver={(event) => {
                                            if (!canReorder) {
                                                return
                                            }
                                            event.preventDefault()
                                        }}
                                        onDrop={() => onDropToSlot(globalIndex)}
                                    >
                                        {member ? (
                                            <img
                                                src={member.imageUrl}
                                                alt={member.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <img
                                                src={IconAssets.EMPTY_CHARACTER_ICON}
                                                alt="Empty team slot"
                                                className="w-12 h-12 object-contain"
                                            />
                                        )}
                                    </div>
                                    <div className="flex items-center justify-center border border-white/20 border-2 aspect-square">
                                        {renderWeaponSlot(member)}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <Dialog open={Boolean(weaponPicker)} onOpenChange={(open) => !open && setWeaponPicker(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Select Weapon</DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-5 gap-3 max-h-[60vh] overflow-y-auto">
                        {weaponPickerOptions.map((weapon) => {
                            const isSelected =
                                weaponPicker &&
                                selectedWeaponByCharacterName[weaponPicker.characterName] === weapon.id

                            return (
                                <button
                                    key={weapon.id}
                                    type="button"
                                    onClick={() =>
                                        weaponPicker && onSelectWeapon(weaponPicker.characterName, weapon.id)
                                    }
                                    className={cn(
                                        'flex flex-col items-center gap-2 rounded border border-white/20 p-2 bg-white/5 hover:bg-white/10',
                                        isSelected && 'border-emerald-400 bg-emerald-500/10',
                                    )}
                                >
                                    <div className="h-14 w-14 overflow-hidden rounded">
                                        <img
                                            src={weapon.iconUrl ?? IconAssets.EMPTY_CHARACTER_ICON}
                                            alt={weapon.name}
                                            className="h-full w-full object-contain"
                                        />
                                    </div>
                                    <span className="text-xs text-center leading-tight">{weapon.name}</span>
                                </button>
                            )
                        })}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
