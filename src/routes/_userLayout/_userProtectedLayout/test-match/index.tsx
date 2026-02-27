import { matchApi } from "@/apis/match";
import { listMatchesQuerySchema } from "@/apis/match/types";
import MatchDialogForm, {
	type MatchDialogFormValues,
} from "@/components/match/MatchDialogForm";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/hooks/use-app-selector";
import { DateFormat } from "@/lib/constants";
import { selectAuthProfile } from "@/lib/redux/auth.slice";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute(
	"/_userLayout/_userProtectedLayout/test-match/",
)({
	component: RouteComponent,
	validateSearch: zodValidator(listMatchesQuerySchema),
});

function RouteComponent() {
	const searchParams = Route.useSearch();
	const profile = useAppSelector(selectAuthProfile);
	const navigate = Route.useNavigate();
	const [createDialogOpen, setCreateDialogOpen] = useState(false);

	const listMatchesQuery = useQuery({
		queryKey: ["matches", searchParams],
		queryFn: () =>
			matchApi.listMatches({ ...searchParams, accountId: profile?.id }),
	});

	useEffect(() => {
		if (listMatchesQuery.error) {
			toast.error(listMatchesQuery.error.message || "Failed to load matches");
		}
	}, [listMatchesQuery.error]);

	const createMatchMutation = useMutation({
		mutationFn: (values: MatchDialogFormValues) =>
			matchApi.createMatch({
				name: values.name,
				sessionCount: values.sessionCount,
				isParticipant: values.isParticipant ?? false,
			}),
		onSuccess: (response) => {
			toast.success("Match created successfully");
			navigate({
				to: "/test-match/$matchId",
				params: { matchId: response.data!.id },
			});
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create match");
		},
		onSettled: () => {
			setCreateDialogOpen(false);
		},
	});

	return (
		<>
			<div className="flex flex-col gap-4">
				<div className="flex gap-4">
					<Button onClick={() => setCreateDialogOpen(true)}>New Match</Button>
				</div>
				{listMatchesQuery.isLoading && <p>Loading...</p>}
				<div className="flex flex-wrap gap-4">
					{listMatchesQuery.data?.data?.map((match) => (
						<div key={match.id} className="border rounded p-4 w-fit">
							<p>{match.name}</p>
							<p>{dayjs(match.createdAt).format(DateFormat.DEFAULT)}</p>
							<Button
								onClick={() => {
									navigate({
										to: "/test-match/$matchId",
										params: { matchId: match.id },
									});
								}}
							>
								View Match
							</Button>
						</div>
					))}
				</div>
			</div>

			<MatchDialogForm
				mode="create"
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
				onSubmit={createMatchMutation.mutate}
				isLoading={createMatchMutation.isPending}
			/>
		</>
	);
}
