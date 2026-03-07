export const SocketEvent = {
	NOTIFICATION: "notification",
	JOIN_MATCH_ROOM: "join_match_room",
	MATCH_DELETED: "match_deleted",
	PARTICIPANT_JOINED: "participant_joined",
	PARTICIPANT_LEFT: "participant_left",
} as const;

export type SocketEventEnum = (typeof SocketEvent)[keyof typeof SocketEvent];
