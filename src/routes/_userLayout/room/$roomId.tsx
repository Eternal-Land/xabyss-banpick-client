import { matchApi } from "@/apis/match";
import type { MatchStateResponse } from "@/apis/match/types";
import { useSocketEvent } from "@/hooks/use-socket-event";
import { MatchStatus, SocketEvent } from "@/lib/constants";
import { store } from "@/lib/redux";
import { socket } from "@/lib/socket";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_userLayout/room/$roomId")({
	component: RouteComponent,
	beforeLoad: async ({ params }) => {
		console.log("Joining room:", params.roomId);
		await socket.emitWithAck(SocketEvent.JOIN_MATCH_ROOM, params.roomId);
	},
	loader: async ({ params }) => {
		try {
			const matchResponse = await matchApi.getMatch(params.roomId);
			let matchStateResponse: MatchStateResponse | undefined = undefined;

			if (
				matchResponse.data?.status != MatchStatus.COMPLETED &&
				matchResponse.data?.status != MatchStatus.CANCELED
			) {
				matchStateResponse = (await matchApi.getMatchState(params.roomId)).data;
			}

			return { match: matchResponse.data, matchState: matchStateResponse };
		} catch {
			const { profile } = store.getState().auth;
			throw redirect({
				to: "/match",
				search: {
					page: 1,
					take: 10,
					accountId: profile?.id,
				},
			});
		}
	},
	onLeave: ({ params }) => {
		console.log("Leaving room:", params.roomId);
		socket.emit(SocketEvent.LEAVE_MATCH_ROOM, params.roomId);
	},
});

function RouteComponent() {
	const { roomId } = Route.useParams();

	useEffect(() => {
		const joinMatchRoom = async () => {
			try {
				await socket.emitWithAck(SocketEvent.JOIN_MATCH_ROOM, roomId);
			} catch {
				// Best-effort room rejoin after reconnect.
			}
		};

		const onConnect = () => {
			void joinMatchRoom();
		};

		socket.on("connect", onConnect);

		if (socket.connected) {
			void joinMatchRoom();
		}

		return () => {
			socket.off("connect", onConnect);
		};
	}, [roomId]);

	useSocketEvent(SocketEvent.MATCH_DELETED, () => {
		window.location.href = "/match";
	});

	return <Outlet />;
}
