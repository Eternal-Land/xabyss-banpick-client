export const SocketEvent = {
	ERROR: "error",
	NOTIFICATION: "notification",
	JOIN_MATCH_ROOM: "join_match_room",
	LEAVE_MATCH_ROOM: "leave_match_room",
	MATCH_DELETED: "match_deleted",
	UPDATE_MATCH_STATE: "update_match_state",
	MATCH_STARTED: "match_started",
} as const;

export type SocketEventEnum = (typeof SocketEvent)[keyof typeof SocketEvent];
