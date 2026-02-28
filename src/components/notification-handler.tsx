import { useSocketEvent } from "@/hooks/use-socket-event";
import { SocketEvent } from "@/lib/constants";
import { toast } from "sonner";

export default function NotificationHandler() {
	useSocketEvent(SocketEvent.NOTIFICATION, (data) => {
		console.log("Received notification:", data);
		toast.info("You have a new notification");
	});

	return <></>;
}
