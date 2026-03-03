export const SocketEvent = {
	NOTIFICATION: "notification",
	MATCH_INVITATION: "match_invitation",
	INVITATION_ACCEPTED: "invitation_accepted",
	INVITATION_DENIED: "invitation_denied",
	JOIN_MATCH_ROOM: "join_match_room",
	PARTICIPANT_REMOVED: "participant_removed",
	MATCH_INFO_UPDATED: "match_info_updated",
	MATCH_DELETED: "match_deleted",
	PARTICIPANT_JOINED: "participant_joined",
	PARTICIPANT_LEFT: "participant_left",
} as const;

export type SocketEventEnum = (typeof SocketEvent)[keyof typeof SocketEvent];
