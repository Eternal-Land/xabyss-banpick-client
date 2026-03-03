export const NotificationType = {
	MATCH_INVITATION: "match_invitation",
} as const;

export type NotificationTypeEnum =
	(typeof NotificationType)[keyof typeof NotificationType];
