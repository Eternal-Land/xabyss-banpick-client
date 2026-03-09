import { matchApi } from "@/apis/match";
import { SocketEvent } from "@/lib/constants";
import { socket } from "@/lib/socket";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_userLayout/room/$roomId")({
	component: RouteComponent,
	loader: async ({ context, params }) =>
		context.queryClient.ensureQueryData({
			queryKey: ["room", params.roomId],
			queryFn: () => matchApi.getMatch(params.roomId),
		}),
});

function RouteComponent() {
	const { roomId } = Route.useParams();

	useEffect(() => {
		console.log("Joining room:", roomId);
		socket.emit(SocketEvent.JOIN_MATCH_ROOM, roomId);

		return () => {
			console.log("Leaving room:", roomId);
			socket.emit(SocketEvent.LEAVE_MATCH_ROOM, roomId);
		};
	}, []);

	return <Outlet />;
}
