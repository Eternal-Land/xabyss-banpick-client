export const SocketEvent = {
	NOTIFICATION: "notification",
} as const;

export type SocketEventEnum = (typeof SocketEvent)[keyof typeof SocketEvent];
