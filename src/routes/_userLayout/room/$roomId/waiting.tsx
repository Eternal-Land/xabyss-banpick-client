import type { MatchStateResponse } from "@/apis/match/types";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAppSelector } from "@/hooks/use-app-selector";
import { useSocketEvent } from "@/hooks/use-socket-event";
import { matchLocaleKeys } from "@/i18n/keys";
import { getTranslationToken } from "@/i18n/namespaces";
import { SocketEvent } from "@/lib/constants";
import { IconAssets } from "@/lib/constants/icon-assets";
import { selectAuthProfile } from "@/lib/redux/auth.slice";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { Copy } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const Route = createFileRoute("/_userLayout/room/$roomId/waiting")({
	component: RouteComponent,
});

interface CopyLinkButtonProps {
	link: string;
	onCopySuccess: string;
	onCopyError: string;
}

function CopyLinkButton({
	link,
	onCopySuccess,
	onCopyError,
}: CopyLinkButtonProps) {
	return (
		<Button
			variant="ghost"
			onClick={async () => {
				try {
					await navigator.clipboard.writeText(link);
					toast.info(onCopySuccess);
				} catch (err) {
					toast.error(onCopyError);
				}
			}}
			size="icon"
		>
			<Copy className="size-4" />
		</Button>
	);
}

function RouteComponent() {
	const { t } = useTranslation();
	const tMatch = (key: string, options?: Record<string, string | number>) =>
		t(getTranslationToken("match", key), options);
	const { match, matchState } = useLoaderData({
		from: "/_userLayout/room/$roomId",
	});
	const [pageMatchState, setPageMatchState] = useState<
		MatchStateResponse | undefined
	>(matchState);

	const profile = useAppSelector(selectAuthProfile);
	const bluePlayer = match?.bluePlayer;
	const redPlayer = match?.redPlayer;
	const isHostJoined = Boolean(pageMatchState?.hostJoined);
	const isBlueJoined = Boolean(bluePlayer && pageMatchState?.bluePlayerJoined);
	const isRedJoined = Boolean(redPlayer && pageMatchState?.redPlayerJoined);
	const connectedPlayerCount = Number(isBlueJoined) + Number(isRedJoined);
	const waitingPlayers = Math.max(0, 2 - connectedPlayerCount);
	const canStartGame = isHostJoined && isBlueJoined && isRedJoined;
	const isHost = match?.host?.id == profile?.id;

	useSocketEvent(
		SocketEvent.UPDATE_MATCH_STATE,
		(matchState: MatchStateResponse) => {
			setPageMatchState(matchState);
		},
	);

	if (!match) {
		return (
			<div className="min-h-screen w-full flex items-center justify-center text-xl text-red-500">
				{tMatch(matchLocaleKeys.match_waiting_load_error)}
			</div>
		);
	}

	return (
		<div className="min-h-screen max-w-screen">
			<div className="grid grid-cols-4 gap-4 h-dvh p-4">
				<div className="flex flex-col h-full justify-center items-center gap-2">
					<h1 className="text-4xl font-bold text-sky-400 capitalize">
						{tMatch(matchLocaleKeys.match_waiting_blue_player)}
					</h1>
					<div
						className={`h-2.5 w-2.5 rounded-full ${isBlueJoined ? "bg-emerald-500" : "bg-amber-500"}`}
					/>

					<div className="w-32 h-32 rounded-full object-cover mt-4 flex items-center justify-center overflow-hidden">
						{bluePlayer?.avatar ? (
							<img
								src={bluePlayer.avatar}
								alt={tMatch(matchLocaleKeys.match_waiting_blue_avatar_alt)}
								className="w-full h-full"
							/>
						) : (
							<img
								src={IconAssets.EMPTY_CHARACTER_ICON}
								alt={tMatch(matchLocaleKeys.match_waiting_blue_avatar_alt)}
								className="w-12 h-12"
							/>
						)}
					</div>

					<span className="text-xl mt-2">
						{isBlueJoined
							? bluePlayer?.displayName
							: tMatch(matchLocaleKeys.match_waiting_connecting)}
					</span>
					<span className="text-xl mt-2">
						{tMatch(matchLocaleKeys.match_waiting_uid_label)}:{" "}
						{bluePlayer?.ingameUuid ?? "-"}
					</span>
				</div>

				<div className="col-span-2 flex flex-col h-full justify-between items-center py-4">
					<div className="host-area w-full flex justify-center items-center gap-4">
						{match.host?.avatar ? (
							<img
								src={match.host.avatar}
								alt={tMatch(matchLocaleKeys.match_waiting_host_avatar_alt)}
								className="w-20 h-20 rounded-full object-cover"
							/>
						) : (
							<img
								src={IconAssets.EMPTY_CHARACTER_ICON}
								alt={tMatch(matchLocaleKeys.match_waiting_host_avatar_alt)}
								className="w-20 h-20 rounded-full object-cover"
							/>
						)}
						<div className="flex flex-col gap-2">
							<h2 className="text-2xl font-semibold">
								{bluePlayer?.displayName ?? "-"} VS{" "}
								{redPlayer?.displayName ?? "-"}
							</h2>
							<div
								className={`h-2.5 w-2.5 rounded-full ${isHostJoined ? "bg-emerald-500" : "bg-amber-500"}`}
							/>
							<p className="text-gray-500">
								{tMatch(matchLocaleKeys.match_waiting_session_label, {
									sessionCount: match.sessionCount,
								})}
							</p>
							<p className="text-gray-500">
								{tMatch(matchLocaleKeys.match_waiting_host_label, {
									hostName: match.host?.displayName ?? "-",
								})}
							</p>
						</div>
					</div>

					<div className="waiting-indicator flex flex-col items-center gap-4">
						<div className="text-3xl flex items-center gap-2">
							{tMatch(matchLocaleKeys.match_waiting_players_label, {
								count: waitingPlayers,
							})}{" "}
							<Spinner className="size-8" />
						</div>

						<div className="copy-area flex flex-col items-center gap-2">
							<div className="flex items-center gap-2">
								<h1 className="text-gray-400">
									{tMatch(matchLocaleKeys.match_waiting_copy_link)}
								</h1>
								<CopyLinkButton
									link={window.location.href}
									onCopySuccess={tMatch(
										matchLocaleKeys.match_waiting_copy_success,
									)}
									onCopyError={tMatch(matchLocaleKeys.match_waiting_copy_error)}
								/>
							</div>
						</div>
					</div>

					<div className="button-area">
						{isHost && (
							<Button
								className="p-4 text-lg text-gray-700 rounded cursor-pointer"
								disabled={!canStartGame}
							>
								{tMatch(matchLocaleKeys.match_waiting_start_game)}
							</Button>
						)}
					</div>
				</div>

				<div className="flex flex-col h-full justify-center items-center">
					<h1 className="text-4xl font-bold text-red-600 capitalize">
						{tMatch(matchLocaleKeys.match_waiting_red_player)}
					</h1>
					<div
						className={`h-2.5 w-2.5 rounded-full ${isRedJoined ? "bg-emerald-500" : "bg-amber-500"}`}
					/>
					<div className="w-32 h-32 rounded-full object-cover mt-4 flex items-center justify-center border-2 border-dashed border-gray-400 overflow-hidden">
						{redPlayer?.avatar ? (
							<img
								src={redPlayer.avatar}
								alt={tMatch(matchLocaleKeys.match_waiting_red_avatar_alt)}
								className="w-full h-full"
							/>
						) : (
							<img
								src={IconAssets.EMPTY_CHARACTER_ICON}
								alt={tMatch(matchLocaleKeys.match_waiting_red_avatar_alt)}
								className="w-12 h-12"
							/>
						)}
					</div>
					<span className="text-xl mt-2">
						{isRedJoined
							? redPlayer?.displayName
							: tMatch(matchLocaleKeys.match_waiting_connecting)}
					</span>
					<span className="text-xl mt-2">
						{redPlayer?.ingameUuid
							? `${tMatch(matchLocaleKeys.match_waiting_uid_label)}: ${redPlayer.ingameUuid}`
							: ""}
					</span>
				</div>
			</div>
		</div>
	);
}
