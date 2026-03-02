import { matchApi } from "@/apis/match";
import type { MatchInvitationResponse } from "@/apis/match/types";
import type { ProfileResponse } from "@/apis/self/types";
import MatchDialogForm, {
	type MatchDialogFormValues,
} from "@/components/match/MatchDialogForm";
import MatchInviteDialog from "@/components/match/MatchInviteDialog";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSocketEvent } from "@/hooks/use-socket-event";
import { DateFormat, SocketEvent } from "@/lib/constants";
import { socket } from "@/lib/socket";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import { EditIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute(
	"/_userLayout/_userProtectedLayout/test-match/$matchId",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { matchId } = Route.useParams();

	useEffect(() => {
		socket.emit(SocketEvent.JOIN_MATCH_ROOM, matchId);
	}, [matchId]);

	const getMatchQuery = useQuery({
		queryKey: ["match", matchId],
		queryFn: () => matchApi.getMatch(matchId!),
		enabled: !!matchId,
	});

	useSocketEvent(
		SocketEvent.INVITATION_ACCEPTED,
		(payload?: ProfileResponse) => {
			if (payload?.matchId && payload.matchId !== matchId) {
				return;
			}

			getMatchQuery.refetch();
			toast.success(
				payload?.message ??
					(payload?.displayName
						? `${payload.displayName} accepted your invitation`
						: "Invitation accepted"),
			);
		},
	);

	useSocketEvent(SocketEvent.INVITATION_DENIED, (payload?: ProfileResponse) => {
		if (payload?.matchId && payload.matchId !== matchId) {
			return;
		}

		getMatchQuery.refetch();
		toast.info(
			payload?.message ??
				(payload?.displayName
					? `${payload.displayName} denied your invitation`
					: "Invitation denied"),
		);
	});

	const match = getMatchQuery.data?.data;
	const invitations = match?.invitations ?? [];
	const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

	const updateMatchMutation = useMutation({
		mutationFn: (values: MatchDialogFormValues) =>
			matchApi.updateMatch(match!.id, {
				name: values.name,
				sessionCount: values.sessionCount,
			}),
		onSuccess: () => {
			getMatchQuery.refetch();
			toast.success("Match updated successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update match");
		},
		onSettled: () => {
			setUpdateDialogOpen(false);
		},
	});

	const renderParticipantSlot = (
		participantIndex: number,
		invitation?: MatchInvitationResponse,
	) => {
		const participant = match?.participants?.[participantIndex];

		if (participant) {
			return (
				<div className="flex items-center gap-2">
					<div className="flex items-center gap-2">
						<Avatar>
							<AvatarImage src={participant.avatar} />
						</Avatar>
						<p>{participant.displayName}</p>
					</div>
					<Button size="icon-sm" variant="destructive">
						<XIcon />
					</Button>
				</div>
			);
		}

		if (invitation) {
			return (
				<div className="flex items-center gap-2 rounded-md border p-2">
					<Avatar>
						<AvatarImage src={invitation.inviterAvatarUrl} />
					</Avatar>
					<div className="flex flex-col">
						<p>{invitation.inviterDisplayName}</p>
						<p className="text-xs text-muted-foreground">Invitation pending</p>
					</div>
				</div>
			);
		}

		return (
			<MatchInviteDialog matchId={matchId} onInvited={getMatchQuery.refetch} />
		);
	};

	return (
		<>
			<div>
				{getMatchQuery.isLoading && <p>Loading...</p>}
				{getMatchQuery.error && <p>Error: {getMatchQuery.error.message}</p>}
				{match && (
					<div className="flex flex-col gap-4">
						<div>
							<h1 className="text-2xl mb-2">Match Details</h1>
							<div className="flex gap-4">
								<div>
									<p>
										<span className="text-gray-400 italic">Match Name: </span>
										{match.name}
									</p>
									<p>
										<span className="text-gray-400 italic">Created At: </span>
										{dayjs(match.createdAt).format(DateFormat.DEFAULT)}
									</p>
									<p>
										<span className="text-gray-400 italic">
											Session Count:{" "}
										</span>
										{match.sessionCount}
									</p>
								</div>
								<Button size="icon" onClick={() => setUpdateDialogOpen(true)}>
									<EditIcon />
								</Button>
							</div>
						</div>
						<div>
							<h1 className="text-2xl mb-2">Participants</h1>
							<div className="flex gap-2">
								<div className="flex-1">
									{renderParticipantSlot(0, invitations[0])}
								</div>
								<div className="flex-1">
									{renderParticipantSlot(1, invitations[1])}
								</div>
							</div>
						</div>
					</div>
				)}
			</div>

			<MatchDialogForm
				mode="update"
				values={
					match && {
						name: match.name,
						sessionCount: match.sessionCount,
					}
				}
				open={updateDialogOpen}
				onOpenChange={setUpdateDialogOpen}
				onSubmit={updateMatchMutation.mutate}
				isLoading={updateMatchMutation.isPending}
			/>
		</>
	);
}
