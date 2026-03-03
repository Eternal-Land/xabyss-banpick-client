import type { NotificationTypeEnum } from "@/lib/constants";

export interface NotificationResponse {
	id: string;
	type: NotificationTypeEnum;
	content: string;
	isRead: boolean;
	createdAt: Date;
}
