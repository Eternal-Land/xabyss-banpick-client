import type { ProfileResponse } from "@/apis/self/types";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { matchLocaleKeys } from "@/i18n/keys";
import { getTranslationToken } from "@/i18n/namespaces";
import { MoreVertical, Trash2 } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface MatchContainerProps {
	player1: ProfileResponse;
	player2: ProfileResponse;
	statusLabel?: string;
	statusClassName?: string;
	onClick?: () => void;
	matchId?: string;
	isHost?: boolean;
	onDelete?: (matchId: string) => void;
}

const PlayerContainer = ({
	player,
	isOpponent = false,
}: {
	player: ProfileResponse;
	isOpponent: boolean;
}) => {
	return (
		<div
			className={cn(
				"flex items-center gap-4",
				isOpponent ? "flex-row-reverse" : "",
			)}
		>
			<img
				src={player.avatar}
				alt={player.displayName}
				className="w-10 h-10 rounded-full"
			/>
			<div className="flex flex-col gap-2">
				<div className={cn(isOpponent ? "text-right" : "")}>
					{player.displayName}
				</div>
				<div className="text-sm text-white/75">UID: {player.ingameUuid}</div>
			</div>
		</div>
	);
};

const MatchContainer = ({
	player1,
	player2,
	statusLabel,
	statusClassName,
	onClick,
	matchId,
	isHost,
	onDelete,
}: MatchContainerProps) => {
	const { t } = useTranslation();
	const tMatch = (key: string) => t(getTranslationToken("match", key));
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	return (
		<div
			className={cn(
				"relative flex w-full flex-col items-center justify-center gap-4",
				"border border-white rounded-lg p-4",
				"bg-gradient-to-r from-sky-400/50 from-0% via-white/0 via-50% to-red-600/50 to-100%",
				"text-white",
				"hover:bg-gradient-to-r hover:from-sky-400 hover:to-red-600",
				"transition-colors duration-300",
			)}
			onClick={onClick}
		>
			<div className="text-xl font-bold">
				{player1.displayName} VS {player2.displayName}
			</div>

			{statusLabel && (
				<div className="w-full flex justify-center">
					<span
						className={cn(
							"rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
							"border-white/30 bg-black/30",
							statusClassName,
						)}
					>
						{statusLabel}
					</span>
				</div>
			)}
			
			<div className="flex justify-between items-center w-full">
				<PlayerContainer player={player1} isOpponent={false} />
				<PlayerContainer player={player2} isOpponent={true} />
			</div>
			{isHost && matchId && onDelete && (
				<div className="absolute top-[10px] right-[10px]">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className="h-6 w-6 rounded-sm"
								onClick={(e) => e.stopPropagation()}
							>
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								className="text-rose-400 focus:text-rose-300 focus:bg-rose-950/30 cursor-pointer"
								onClick={(e) => {
									e.stopPropagation();
									setIsDeleteOpen(true);
								}}
							>
								<Trash2 className="h-4 w-4 mr-2" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
						<DialogContent onClick={(event) => event.stopPropagation()}>
							<DialogHeader>
								<DialogTitle>
									{tMatch(matchLocaleKeys.match_delete_title)}
								</DialogTitle>
								<DialogDescription>
									{tMatch(matchLocaleKeys.match_delete_description)}
								</DialogDescription>
							</DialogHeader>
							<Alert variant="destructive">
								<AlertTitle>
									{tMatch(matchLocaleKeys.match_delete_alert_title)}
								</AlertTitle>
								<AlertDescription>
									{tMatch(matchLocaleKeys.match_delete_alert_description)}
								</AlertDescription>
							</Alert>
							<DialogFooter>
								<Button
									variant="ghost"
									onClick={(event) => {
										event.stopPropagation();
										setIsDeleteOpen(false);
									}}
								>
									{tMatch(matchLocaleKeys.match_delete_cancel)}
								</Button>
								<Button
									variant="destructive"
									onClick={(event) => {
										event.stopPropagation();
										setIsDeleteOpen(false);
										onDelete(matchId);
									}}
								>
									{tMatch(matchLocaleKeys.match_delete_confirm)}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			)}
		</div>
	);
};

export default MatchContainer;

