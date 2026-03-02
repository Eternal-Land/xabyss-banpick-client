export const SocketEvent = {
	NOTIFICATION: "notification",
	MATCH_INVITATION: "match_invitation",
	INVITATION_ACCEPTED: "invitation_accepted",
	INVITATION_DENIED: "invitation_denied",
	JOIN_MATCH_ROOM: "join_match_room",
} as const;

export type SocketEventEnum = (typeof SocketEvent)[keyof typeof SocketEvent];
