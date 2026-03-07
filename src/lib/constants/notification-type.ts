export const NotificationType = {} as const;

export type NotificationTypeEnum =
	(typeof NotificationType)[keyof typeof NotificationType];
