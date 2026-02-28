import { io } from "socket.io-client";

export const SOCKET_URI =
	import.meta.env.VITE_SOCKET_URI ?? "http://localhost:3000";

export const socket = io(SOCKET_URI, {
	withCredentials: true,
	transports: ["websocket"],
});

socket.on("connect", () => {
	console.log("Connected to socket server");
});

socket.on("disconnect", (reason) => {
	console.log("Disconnected from socket server:", reason);
});
