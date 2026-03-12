import type { SocketEventEnum } from "@/lib/constants";
import { socket } from "@/lib/socket";
import { useEffect, useRef } from "react";

export function useSocketEvent(
	event: SocketEventEnum,
	callback: (...args: any[]) => void,
) {
	const callbackRef = useRef(callback);

	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	useEffect(() => {
		const listener = (...args: any[]) => {
			callbackRef.current(...args);
		};

		socket.on(event, listener);

		return () => {
			socket.off(event, listener);
		};
	}, [event]);
}
