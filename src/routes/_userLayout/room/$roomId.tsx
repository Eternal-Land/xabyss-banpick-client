import { matchApi } from "@/apis/match";
import { SocketEvent } from "@/lib/constants";
import { store } from "@/lib/redux";
import { socket } from "@/lib/socket";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_userLayout/room/$roomId")({
	component: RouteComponent,
	beforeLoad: async ({ params }) => {
		console.log("Joining room:", params.roomId);
		await socket.emitWithAck(SocketEvent.JOIN_MATCH_ROOM, params.roomId);
	},
	loader: async ({ context, params }) => {
		try {
			const [matchResponse, matchStateResponse] = await Promise.all([
				context.queryClient.ensureQueryData({
					queryKey: ["room", params.roomId],
					queryFn: () => matchApi.getMatch(params.roomId),
				}),
				context.queryClient.ensureQueryData({
					queryKey: ["matchState", params.roomId],
					queryFn: () => matchApi.getMatchState(params.roomId),
				}),
			]);

			return { match: matchResponse.data, matchState: matchStateResponse.data };
		} catch (err) {
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
	return <Outlet />;
}
