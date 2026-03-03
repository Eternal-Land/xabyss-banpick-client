import { matchApi } from "@/apis/match";
import type { MatchInvitationResponse } from "@/apis/match/types";
import type { NotificationResponse } from "@/apis/notifications/types";
import { useSocketEvent } from "@/hooks/use-socket-event";
import { NotificationType, SocketEvent } from "@/lib/constants";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Button } from "./ui/button";

function handleMatchInvitationNotification(content: string) {
	const data = JSON.parse(content) as MatchInvitationResponse;

	const handleAccept = async () => {
		try {
			await matchApi.acceptMatchInvitation(data.invitationId);
			toast.success("You have accepted the match invitation");
			window.location.href = "/test-match/" + data.matchId;
		} catch (err) {
			let errMsg = "Failed to accept the match invitation";
			if (err instanceof AxiosError) {
				errMsg =
					err.response?.data?.message ??
					"Failed to accept the match invitation";
			} else {
				errMsg = err instanceof Error ? err.message : String(err);
			}
			toast.error(errMsg);
		}
	};

	const handleDeny = async () => {
		try {
			await matchApi.denyMatchInvitation(data.invitationId);
			toast.info("You have denied the match invitation");
		} catch (err) {
			let errMsg = "Failed to deny the match invitation";
			if (err instanceof AxiosError) {
				errMsg =
					err.response?.data?.message ?? "Failed to deny the match invitation";
			} else {
				errMsg = err instanceof Error ? err.message : String(err);
			}
			toast.error(errMsg);
		}
	};

	toast.info(
		<div className="flex justify-between items-center max-w-md">
			<div className="flex gap-2 items-center">
				<p>{`You have been invited to "${data.matchName}"`}</p>
			</div>
			<div className="flex flex-col gap-2">
				<Button variant="destructive" size="xs" onClick={handleDeny}>
					Deny
				</Button>
				<Button size="xs" onClick={handleAccept}>
					Accept
				</Button>
			</div>
		</div>,
	);
}

export default function NotificationHandler() {
	useSocketEvent(SocketEvent.NOTIFICATION, (data: NotificationResponse) => {
		switch (data?.type) {
			case NotificationType.MATCH_INVITATION:
				handleMatchInvitationNotification(data.content);
				break;
			default:
				toast.info(data?.content || "You have a new notification");
				break;
		}
	});

	return <></>;
}
