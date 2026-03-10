export const SocketEvent = {
	NOTIFICATION: "notification",
	JOIN_MATCH_ROOM: "join_match_room",
	LEAVE_MATCH_ROOM: "leave_match_room",
	MATCH_DELETED: "match_deleted",
	UPDATE_MATCH_STATE: "update_match_state",
	ERROR: "error",
} as const;

export type SocketEventEnum = (typeof SocketEvent)[keyof typeof SocketEvent];
