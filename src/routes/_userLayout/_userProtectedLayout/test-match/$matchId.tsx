import { matchApi } from "@/apis/match";
import MatchDialogForm, {
	type MatchDialogFormValues,
} from "@/components/match/MatchDialogForm";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DateFormat } from "@/lib/constants";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import { EditIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute(
	"/_userLayout/_userProtectedLayout/test-match/$matchId",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { matchId } = Route.useParams();
	const getMatchQuery = useQuery({
		queryKey: ["match", matchId],
		queryFn: () => matchApi.getMatch(matchId!),
		enabled: !!matchId,
	});
	const match = getMatchQuery.data?.data;
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
									{match.participants?.[0] ? (
										<div className="flex items-center gap-2">
											<div className="flex items-center gap-2">
												<Avatar>
													<AvatarImage src={match.participants[0].avatar} />
												</Avatar>
												<p>{match.participants[0].displayName}</p>
											</div>
											<Button size="icon-sm" variant="destructive">
												<XIcon />
											</Button>
										</div>
									) : (
										<Button>Invite</Button>
									)}
								</div>
								<div className="flex-1">
									<Button>Invite</Button>
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
