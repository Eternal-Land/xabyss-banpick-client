import { matchApi } from "@/apis/match";
import type { MatchInvitationResponse } from "@/apis/match/types";
import type { ProfileResponse } from "@/apis/self/types";
import MatchDialogForm, {
	type MatchDialogFormValues,
} from "@/components/match/MatchDialogForm";
import MatchInviteDialog from "@/components/match/MatchInviteDialog";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useMatchTypeLabel } from "@/hooks/use-match-type-label";
import { useAppSelector } from "@/hooks/use-app-selector";
import { useSocketEvent } from "@/hooks/use-socket-event";
import { DateFormat, SocketEvent } from "@/lib/constants";
import { selectAuthProfile } from "@/lib/redux/auth.slice";
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
	const profile = useAppSelector(selectAuthProfile);
	const matchTypeLabels = useMatchTypeLabel();

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
			getMatchQuery.refetch();
			toast.success(
				payload?.displayName
					? `${payload.displayName} accepted your invitation`
					: "Invitation accepted",
			);
		},
	);

	useSocketEvent(SocketEvent.MATCH_INFO_UPDATED, () => {
		getMatchQuery.refetch();
	});

	useSocketEvent(SocketEvent.MATCH_DELETED, () => {
		toast.info("The match has been deleted");
		window.location.href = "/test-match";
	});

	useSocketEvent(SocketEvent.INVITATION_DENIED, (payload?: ProfileResponse) => {
		getMatchQuery.refetch();
		toast.info(
			payload?.displayName
				? `${payload.displayName} denied your invitation`
				: "Invitation denied",
		);
	});

	useSocketEvent(SocketEvent.PARTICIPANT_REMOVED, (participantId: string) => {
		if (participantId === profile?.id) {
			toast.error("You have been removed from the match");
			window.location.href = "/test-match";
			return;
		}
		getMatchQuery.refetch();
	});

	useSocketEvent(SocketEvent.PARTICIPANT_JOINED, () => {
		getMatchQuery.refetch();
	});

	useSocketEvent(SocketEvent.PARTICIPANT_LEFT, () => {
		getMatchQuery.refetch();
	});

	const match = getMatchQuery.data?.data;
	const isHost = profile?.id === match?.host?.id;
	const invitations = match?.invitations ?? [];
	const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
	const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
	const [selectedParticipant, setSelectedParticipant] = useState<
		ProfileResponse | undefined
	>(undefined);

	const updateMatchMutation = useMutation({
		mutationFn: (values: MatchDialogFormValues) =>
			matchApi.updateMatch(match!.id, {
				name: values.name,
				sessionCount: values.sessionCount,
				type: values.type,
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

	const removeParticipantMutation = useMutation({
		mutationFn: (participantId: string) =>
			matchApi.removeParticipant(match!.id, participantId),
		onSuccess: () => {
			getMatchQuery.refetch();
			toast.success("Participant removed successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to remove participant");
		},
		onSettled: () => {
			setRemoveDialogOpen(false);
			setSelectedParticipant(undefined);
		},
	});

	const joinAsParticipantMutation = useMutation({
		mutationFn: () => matchApi.joinAsParticipant(match!.id),
		onError: (error) => {
			toast.error(error.message || "Failed to join match");
		},
	});

	const leaveMatchMutation = useMutation({
		mutationFn: () => matchApi.leaveMatch(match!.id),
		onSuccess: () => {
			toast.success("You have left the match");
			if (!isHost) {
				window.location.href = "/test-match";
			}
		},
		onError: (error) => {
			toast.error(error.message || "Failed to leave match");
		},
	});

	const onRemoveParticipantClick = (participant: ProfileResponse) => {
		setSelectedParticipant(participant);
		setRemoveDialogOpen(true);
	};

	const onConfirmRemoveParticipant = () => {
		if (!selectedParticipant) {
			return;
		}
		removeParticipantMutation.mutate(selectedParticipant.id);
	};

	const renderParticipantSlot = (
		participantIndex: number,
		invitation?: MatchInvitationResponse,
		isHost: boolean = false,
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
					{participant.id === profile?.id && (
						<Button
							variant="outline"
							onClick={() => leaveMatchMutation.mutate()}
							disabled={leaveMatchMutation.isPending}
						>
							Leave
						</Button>
					)}
					{isHost && participant.id !== profile?.id && (
						<Button
							size="icon-sm"
							variant="destructive"
							onClick={() => onRemoveParticipantClick(participant)}
						>
							<XIcon />
						</Button>
					)}
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
			isHost && (
				<div className="flex gap-2">
					<MatchInviteDialog
						matchId={matchId}
						onInvited={getMatchQuery.refetch}
					/>
					<Button onClick={() => joinAsParticipantMutation.mutate()}>
						Join
					</Button>
				</div>
			)
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
									<p>
										<span className="text-gray-400 italic">Type: </span>
										{matchTypeLabels[match.type]}
									</p>
								</div>
								{isHost && (
									<Button size="icon" onClick={() => setUpdateDialogOpen(true)}>
										<EditIcon />
									</Button>
								)}
							</div>
						</div>
						<div>
							<h1 className="text-2xl mb-2">Participants</h1>
							<div className="flex gap-2">
								<div className="flex-1">
									{renderParticipantSlot(0, invitations[0], isHost)}
								</div>
								<div className="flex-1">
									{renderParticipantSlot(1, invitations[1], isHost)}
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
						type: match.type,
					}
				}
				open={updateDialogOpen}
				onOpenChange={setUpdateDialogOpen}
				onSubmit={updateMatchMutation.mutate}
				isLoading={updateMatchMutation.isPending}
			/>

			<Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Remove participant</DialogTitle>
						<DialogDescription>
							Are you sure you want to remove
							{selectedParticipant?.displayName
								? ` ${selectedParticipant.displayName}`
								: " this participant"}{" "}
							from this match?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setRemoveDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={onConfirmRemoveParticipant}
							disabled={removeParticipantMutation.isPending}
						>
							Remove
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
