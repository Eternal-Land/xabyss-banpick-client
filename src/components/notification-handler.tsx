import type { NotificationResponse } from "@/apis/notifications/types";
import { useSocketEvent } from "@/hooks/use-socket-event";
import { SocketEvent } from "@/lib/constants";
import { toast } from "sonner";


export default function NotificationHandler() {
	useSocketEvent(SocketEvent.NOTIFICATION, (data: NotificationResponse) => {
		switch (data?.type) {
			default:
				toast.info(data?.content || "You have a new notification");
				break;
		}
	});

	return <></>;
}
