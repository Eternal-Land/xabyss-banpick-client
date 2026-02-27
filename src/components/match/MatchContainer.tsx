import { cn } from "@/lib/utils"

interface PlayerInfo {
    name: string;
    uid: string;
    avatarUrl: string;
}

interface MatchContainerProps {
    player1: PlayerInfo;
    player2: PlayerInfo;
    matchTitle: string;
    onClick?: () => void;
}

const PlayerContainer = ({ player, isOpponent = false }: { player: PlayerInfo; isOpponent: boolean }) => {
    return (
        <div className={cn("flex items-center gap-4", isOpponent ? "flex-row-reverse" : "")}>
            <img src={player.avatarUrl} alt={player.name}
                className="w-10 h-10 rounded-full" />
            <div className="flex flex-col gap-2">
                <div className={cn(isOpponent ? "text-right" : "")}>{player.name}</div>
                <div className="text-sm text-white/75">UID: {player.uid}</div>
            </div>
        </div>
    )
}

const MatchContainer = ({ player1, player2, matchTitle, onClick }: MatchContainerProps) => {
    return (
        <div
            className={cn(
                "flex w-full flex-col items-center justify-center gap-4",
                "border border-white rounded-lg p-4",
                "bg-gradient-to-r from-sky-400/50 from-0% via-white/0 via-50% to-red-600/50 to-100%",
                "text-white",
                "hover:bg-gradient-to-r hover:from-sky-400 hover:to-red-600",
                "transition-colors duration-300",
            )}
            onClick={onClick}
        >
            <div className="text-xl font-bold">{matchTitle}</div>
            <div className="flex justify-between items-center w-full">
                <PlayerContainer player={player1} isOpponent={false} />
                <PlayerContainer player={player2} isOpponent={true} />
            </div>
        </div>
    )
}

export default MatchContainer