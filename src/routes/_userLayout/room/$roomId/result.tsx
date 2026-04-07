import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import { matchApi } from "@/apis/match";
import { sessionRecordApi } from "@/apis/session-record";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/hooks/use-app-selector";
import { useSocketEvent } from "@/hooks/use-socket-event";
import { MatchStatus, PlayerSide, SocketEvent } from "@/lib/constants";
import { selectAuthProfile } from "@/lib/redux/auth.slice";
import { cn } from "@/lib/utils";
import { useCallback, useEffect } from "react";

export const Route = createFileRoute("/_userLayout/room/$roomId/result")({
	component: MatchResultComponent,
});

function MatchResultComponent() {
	const navigate = Route.useNavigate();
	const { roomId } = Route.useParams();
	const { match } = useLoaderData({
		from: "/_userLayout/room/$roomId",
	});
	const profile = useAppSelector(selectAuthProfile);

	const navigateByMatchStatus = useCallback(
		(status?: number) => {
			switch (status) {
				case MatchStatus.COMPLETED:
					return;
				case MatchStatus.LIVE:
					void navigate({
						to: "/room/$roomId/ban-pick",
						params: { roomId },
					});
					return;
				case MatchStatus.WAITING:
					void navigate({
						to: "/room/$roomId/waiting",
						params: { roomId },
					});
					return;
				default:
					void navigate({
						to: "/match",
						search: {
							page: 1,
							take: 10,
							accountId: profile?.id,
						},
					});
			}
		},
		[navigate, profile?.id, roomId],
	);

	useSocketEvent(SocketEvent.MATCH_UPDATED, (data: any) => {
		navigateByMatchStatus(data?.status);
	});

	useSocketEvent(SocketEvent.UPDATE_MATCH_SESSION, () => {
		void (async () => {
			try {
				const response = await matchApi.getMatch(roomId);
				navigateByMatchStatus(response.data?.status);
			} catch {
				// Session update navigation is best-effort.
			}
		})();
	});

	useEffect(() => {
		if (!match) {
			void navigate({
				to: "/match",
				search: {
					page: 1,
					take: 10,
					accountId: profile?.id,
				},
			});
			return;
		}

		navigateByMatchStatus(match.status);
	}, [match, navigate, navigateByMatchStatus, profile?.id]);

	const { data: reportResponse, isLoading } = useQuery({
		queryKey: ["match-report", roomId],
		queryFn: () => sessionRecordApi.getMatchReport(roomId),
	});

	if (isLoading || !reportResponse?.data) {
		return (
			<div className="flex h-dvh w-full items-center justify-center p-4">
				<h1 className="animate-pulse text-2xl text-white/50">
					Loading Results...
				</h1>
			</div>
		);
	}

	const report = reportResponse.data;
	const bluePlayer = report.bluePlayer;
	const redPlayer = report.redPlayer;
	const totalSessions = report.sessions.length;

	let blueWins = 0;
	let redWins = 0;

	report.sessions.forEach((session) => {
		if (session.winnerSide === null) return;

		if (session.winnerSide === PlayerSide.BLUE) {
			if (session.blueParticipant?.id === bluePlayer?.id) {
				blueWins++;
			} else {
				redWins++;
			}
		} else if (session.winnerSide === PlayerSide.RED) {
			if (session.redParticipant?.id === redPlayer?.id) {
				redWins++;
			} else {
				blueWins++;
			}
		}
	});

	const finalResultLabel =
		blueWins > redWins
			? `${bluePlayer?.displayName ?? "Blue"} wins`
			: redWins > blueWins
				? `${redPlayer?.displayName ?? "Red"} wins`
				: "Draw";

	const finalResultClassName =
		blueWins > redWins
			? "text-sky-400"
			: redWins > blueWins
				? "text-red-400"
				: "text-amber-300";

	const sessionRows = report.sessions.map((session, index) => {
		const isBlueLeft = session.blueParticipant?.id === bluePlayer?.id;
		const leftName = isBlueLeft
			? (bluePlayer?.displayName ?? "Blue")
			: (redPlayer?.displayName ?? "Red");
		const rightName = isBlueLeft
			? (redPlayer?.displayName ?? "Red")
			: (bluePlayer?.displayName ?? "Blue");

		const leftFinalTime = isBlueLeft
			? (session.record?.blueFinalTime ?? 0)
			: (session.record?.redFinalTime ?? 0);
		const rightFinalTime = isBlueLeft
			? (session.record?.redFinalTime ?? 0)
			: (session.record?.blueFinalTime ?? 0);

		const leftBonus = isBlueLeft
			? Number(session.cost?.blueTimeBonusCost ?? 0)
			: Number(session.cost?.redTimeBonusCost ?? 0);
		const rightBonus = isBlueLeft
			? Number(session.cost?.redTimeBonusCost ?? 0)
			: Number(session.cost?.blueTimeBonusCost ?? 0);

		const leftTotalTime = leftFinalTime + leftBonus;
		const rightTotalTime = rightFinalTime + rightBonus;

		let leftWon = false;
		let rightWon = false;

		if (session.winnerSide === PlayerSide.BLUE) {
			leftWon = isBlueLeft;
			rightWon = !isBlueLeft;
		} else if (session.winnerSide === PlayerSide.RED) {
			leftWon = !isBlueLeft;
			rightWon = isBlueLeft;
		}

		const winnerLabel =
			session.winnerSide === null ? "Draw" : leftWon ? leftName : rightName;

		return {
			index,
			id: session.matchSessionId,
			leftName,
			rightName,
			leftFinalTime,
			rightFinalTime,
			leftBonus,
			rightBonus,
			leftTotalTime,
			rightTotalTime,
			leftWon,
			rightWon,
			winnerLabel,
		};
	});

	return (
		<div className="min-h-screen w-full flex flex-col p-8">
			{/* Background */}
			<div className="bg-transparent bg-radial from-amber-500/10 from-0% to-white/0 to-70% fixed inset-0 z-[-2] h-screen w-full"></div>

			<div className="mx-auto max-w-4xl w-full">
				<div className="flex items-center justify-between mb-8">
					<h1 className="text-4xl font-bold font-serif bg-linear-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
						Match Scoreboard
					</h1>
					<Link to="/">
						<Button variant="outline" className="border-white/20">
							Back to Lobby
						</Button>
					</Link>
				</div>

				{/* Score Card */}
				<div className="rounded-2xl border border-white/20 bg-black/40 backdrop-blur-xl p-8 shadow-2xl mb-8 flex items-center justify-center gap-12">
					<div className="flex flex-col items-center gap-4 flex-1">
						<img
							src={bluePlayer?.avatar || "/imgs/default-avatar.png"}
							alt={bluePlayer?.displayName ?? "Blue"}
							className="h-24 w-24 rounded-full border-4 border-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.5)]"
						/>
						<span className="text-2xl font-bold text-sky-400">
							{bluePlayer?.displayName}
						</span>
					</div>

					<div className="flex items-center gap-8 px-8 flex-none">
						<span className="text-6xl font-bold text-sky-500">{blueWins}</span>
						<span className="text-4xl font-bold text-white/40">-</span>
						<span className="text-6xl font-bold text-red-500">{redWins}</span>
					</div>

					<div className="flex flex-col items-center gap-4 flex-1">
						<img
							src={redPlayer?.avatar || "/imgs/default-avatar.png"}
							alt={redPlayer?.displayName ?? "Red"}
							className="h-24 w-24 rounded-full border-4 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
						/>
						<span className="text-2xl font-bold text-red-400">
							{redPlayer?.displayName}
						</span>
					</div>
				</div>

				<div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-6 mb-8">
					<div className="text-xs uppercase tracking-[0.2em] text-amber-200/70 mb-2">
						Total Result
					</div>
					<div className="flex items-center justify-between gap-4">
						<div className={cn("text-2xl font-bold", finalResultClassName)}>
							{finalResultLabel}
						</div>
						<div className="text-sm text-white/70">
							{blueWins} - {redWins} across {totalSessions} sessions
						</div>
					</div>
				</div>

				<h2 className="text-2xl font-bold mb-4 font-serif">Session Details</h2>

				<div className="grid gap-4">
					{sessionRows.map((session) => {
						return (
							<div
								key={session.id}
								className="rounded-xl border border-white/10 bg-white/5 p-6 flex flex-col transition-all hover:bg-white/10"
							>
								<div className="mb-4 text-center">
									<h3 className="text-lg font-bold text-white/60">
										GAME {session.index + 1}
									</h3>
								</div>

								<div className="flex items-center justify-between gap-6">
									{/* Left Side */}
									<div
										className={cn(
											"flex-1 text-left",
											session.leftWon ? "text-amber-300" : "text-white/80",
										)}
									>
										<div className="text-sm uppercase tracking-wider text-white/50">
											{session.leftName}
										</div>
										<div className="text-xl font-mono font-semibold">
											{session.leftTotalTime}s
										</div>
										<div className="text-xs text-white/50">
											Base {session.leftFinalTime}s + Bonus {session.leftBonus}s
										</div>
									</div>

									{/* Divider */}
									<div className="text-center min-w-24">
										<div className="text-sm text-white/30 mb-1">VS</div>
										<div className="text-xs text-amber-200/90">
											Winner: {session.winnerLabel}
										</div>
									</div>

									{/* Right Side */}
									<div
										className={cn(
											"flex-1 text-right",
											session.rightWon ? "text-amber-300" : "text-white/80",
										)}
									>
										<div className="text-sm uppercase tracking-wider text-white/50">
											{session.rightName}
										</div>
										<div className="text-xl font-mono font-semibold">
											{session.rightTotalTime}s
										</div>
										<div className="text-xs text-white/50">
											Base {session.rightFinalTime}s + Bonus{" "}
											{session.rightBonus}s
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
