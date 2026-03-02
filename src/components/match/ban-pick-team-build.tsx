import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { IconAssets } from '@/lib/constants/icon-assets'
import type { BanPickCharacter } from '@/components/match/ban-pick.types'

export interface BanPickTeamBuildProps {
    picks: BanPickCharacter[]
    titleClassName: string
    slotClassName: string
}

export default function BanPickTeamBuild({
    picks,
    titleClassName,
    slotClassName,
}: BanPickTeamBuildProps) {
    const firstHalf = picks.slice(0, 4)
    const secondHalf = picks.slice(4, 8)

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
                        {Array.from({ length: 4 }).map((_, index) => {
                            const member = firstHalf[index]

                            return (
                                <div key={`first-half-member-${index}`} className="flex flex-col gap-2">
                                    <div
                                        className={cn(
                                            'w-full h-28 flex items-center justify-center border border-2 overflow-hidden rounded-md',
                                            slotClassName,
                                        )}
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
                                        <Plus className="h-6 w-6 text-white/80" />
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
                        {Array.from({ length: 4 }).map((_, index) => {
                            const member = secondHalf[index]

                            return (
                                <div key={`second-half-member-${index}`} className="flex flex-col gap-2">
                                    <div
                                        className={cn(
                                            'w-full h-28 flex items-center justify-center border border-2 overflow-hidden rounded-md',
                                            slotClassName,
                                        )}
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
                                        <Plus className="h-6 w-6 text-white/80" />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
