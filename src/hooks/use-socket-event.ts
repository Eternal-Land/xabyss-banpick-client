import type { SocketEventEnum } from "@/lib/constants";
import { socket } from "@/lib/socket";
import { useEffect } from "react";

export function useSocketEvent(
	event: SocketEventEnum,
	callback: (...args: any[]) => void,
) {
	if (!socket.connected) {
		return;
	}

	useEffect(() => {
		socket.on(event, callback);
		return () => {
			socket.off(event, callback);
		};
	}, [event, callback]);
}
