import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { matchLocaleKeys } from "@/i18n/keys";
import { getTranslationToken } from "@/i18n/namespaces";
import { IconAssets } from "@/lib/constants/icon-assets";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { Copy } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_userLayout/room/$roomId/waiting")({
	component: RouteComponent,
});

function CopyLinkButton() {
	return (
		<Button
			variant="ghost"
			onClick={() => navigator.clipboard.writeText(window.location.href)}
		>
			<Copy className="size-4" />
		</Button>
	);
}

function RouteComponent() {
	const { t } = useTranslation();
	const tMatch = (key: string, options?: Record<string, string | number>) =>
		t(getTranslationToken("match", key), options);
	const matchData = useLoaderData({ from: "/_userLayout/room/$roomId" });

	const COPY_LINKS = [
		tMatch(matchLocaleKeys.match_waiting_copy_opponent_link),
		tMatch(matchLocaleKeys.match_waiting_copy_spectators_link),
		tMatch(matchLocaleKeys.match_waiting_copy_staff_link),
	] as const;

	const match = matchData?.data;
	const bluePlayer = match?.bluePlayer;
	const redPlayer = match?.redPlayer;
	const connectedPlayerCount =
		Number(Boolean(bluePlayer)) + Number(Boolean(redPlayer));
	const waitingPlayers = Math.max(0, 2 - connectedPlayerCount);

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

					<div className="w-32 h-32 rounded-full object-cover mt-4 flex items-center justify-center overflow-hidden">
						{bluePlayer?.avatar ? (
							<img
								src={bluePlayer.avatar}
								alt="Blue Player Avatar"
								className="w-full h-full"
							/>
						) : (
							<img
								src={IconAssets.EMPTY_CHARACTER_ICON}
								alt="Blue Player Avatar"
								className="w-12 h-12"
							/>
						)}
					</div>

					<span className="text-xl mt-2">
						{bluePlayer?.displayName ??
							tMatch(matchLocaleKeys.match_waiting_connecting)}
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
								alt="Host Avatar"
								className="w-20 h-20 rounded-full object-cover"
							/>
						) : (
							<img
								src={IconAssets.EMPTY_CHARACTER_ICON}
								alt="Host Avatar"
								className="w-20 h-20 rounded-full object-cover"
							/>
						)}
						<div className="flex flex-col gap-2">
							<h2 className="text-2xl font-semibold">
								{bluePlayer?.displayName ?? "-"} VS{" "}
								{redPlayer?.displayName ?? "-"}
							</h2>
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
							{COPY_LINKS.map((label) => (
								<div key={label} className="flex items-center gap-2">
									<h1 className="text-gray-400">{label}</h1>
									<CopyLinkButton />
								</div>
							))}
						</div>
					</div>

					<div className="button-area">
						<Button className="p-4 text-lg text-gray-700 rounded cursor-pointer">
							{tMatch(matchLocaleKeys.match_waiting_start_game)}
						</Button>
					</div>
				</div>

				<div className="flex flex-col h-full justify-center items-center">
					<h1 className="text-4xl font-bold text-red-600 capitalize">
						{tMatch(matchLocaleKeys.match_waiting_red_player)}
					</h1>
					<div className="w-32 h-32 rounded-full object-cover mt-4 flex items-center justify-center border-2 border-dashed border-gray-400 overflow-hidden">
						{redPlayer?.avatar ? (
							<img
								src={redPlayer.avatar}
								alt="Red Player Avatar"
								className="w-full h-full"
							/>
						) : (
							<img
								src={IconAssets.EMPTY_CHARACTER_ICON}
								alt="Red Player Avatar"
								className="w-12 h-12"
							/>
						)}
					</div>
					<span className="text-xl mt-2">
						{redPlayer?.displayName ??
							tMatch(matchLocaleKeys.match_waiting_connecting)}
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
