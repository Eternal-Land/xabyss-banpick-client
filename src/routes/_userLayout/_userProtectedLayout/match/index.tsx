import { matchApi } from "@/apis/match";
import { listMatchesQuerySchema } from "@/apis/match/types";
import MatchContainer from "@/components/match/MatchContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppSelector } from "@/hooks/use-app-selector";
import { matchLocaleKeys } from "@/i18n/keys";
import { getTranslationToken } from "@/i18n/namespaces";
import { selectAuthProfile } from "@/lib/redux/auth.slice";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const Route = createFileRoute(
	"/_userLayout/_userProtectedLayout/match/",
)({
	component: RouteComponent,
	validateSearch: zodValidator(listMatchesQuerySchema),
});

function RouteComponent() {
	const { t } = useTranslation();
	const tMatch = (key: string) => t(getTranslationToken("match", key));
	const navigate = Route.useNavigate();
	const filter = Route.useSearch();
	const profile = useAppSelector(selectAuthProfile);
	const [search, setSearch] = useState("");

	const listMatchesQuery = useQuery({
		queryKey: ["matches", filter, profile?.id],
		queryFn: () =>
			matchApi.listMatches({
				...filter,
				accountId: profile?.id,
			}),
	});

	const handleSearchChange = (value: string) => {
		setSearch(value);
	};

	useEffect(() => {
		if (!listMatchesQuery.error) {
			return;
		}

		toast.error(
			listMatchesQuery.error.message ||
				t(getTranslationToken("match", matchLocaleKeys.match_list_load_error)),
		);
	}, [listMatchesQuery.error, t]);

	const filteredMatches = useMemo(() => {
		const matches = listMatchesQuery.data?.data ?? [];
		const normalizedSearch = search.trim().toLowerCase();

		if (!normalizedSearch) {
			return matches;
		}

		return matches.filter((match) => {
			const blueName = match.bluePlayer?.displayName?.toLowerCase() ?? "";
			const redName = match.redPlayer?.displayName?.toLowerCase() ?? "";
			const blueUid = match.bluePlayer?.ingameUuid?.toLowerCase() ?? "";
			const redUid = match.redPlayer?.ingameUuid?.toLowerCase() ?? "";

			return (
				blueName.includes(normalizedSearch) ||
				redName.includes(normalizedSearch) ||
				blueUid.includes(normalizedSearch) ||
				redUid.includes(normalizedSearch)
			);
		});
	}, [listMatchesQuery.data?.data, search]);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/30 p-4 backdrop-blur sm:flex-row sm:items-center">
				<Input
					placeholder={tMatch(matchLocaleKeys.match_list_search_placeholder)}
					value={search}
					onChange={(event) => handleSearchChange(event.target.value)}
				/>
				<div className="flex gap-2 sm:ml-auto">
					<Button
						variant="outline"
						onClick={() => navigate({ to: "/match/create" })}
					>
						{tMatch(matchLocaleKeys.match_list_create_button)}
					</Button>
				</div>
			</div>

			{listMatchesQuery.isLoading && (
				<p>{tMatch(matchLocaleKeys.match_list_loading)}</p>
			)}

			{!listMatchesQuery.isLoading && filteredMatches.length === 0 && (
				<p>{tMatch(matchLocaleKeys.match_list_empty)}</p>
			)}

			{filteredMatches.map((match) => (
				<MatchContainer
					key={match.id}
					player1={{
						name:
							match.bluePlayer?.displayName ||
							tMatch(matchLocaleKeys.match_list_waiting_player),
						uid: match.bluePlayer?.ingameUuid || "-",
						avatarUrl:
							match.bluePlayer?.avatar ||
							"https://res.cloudinary.com/dphtvhtvf/image/upload/v1770611732/genshin-impact-banpick/upload/avatars/euhhui4znfpssjw8laps.jpg",
					}}
					player2={{
						name:
							match.redPlayer?.displayName ||
							tMatch(matchLocaleKeys.match_list_waiting_player),
						uid: match.redPlayer?.ingameUuid || "-",
						avatarUrl:
							match.redPlayer?.avatar ||
							"https://res.cloudinary.com/dphtvhtvf/image/upload/v1770611732/genshin-impact-banpick/upload/avatars/euhhui4znfpssjw8laps.jpg",
					}}
					onClick={() =>
						navigate({
							to: "/room/$roomId/waiting",
							params: {
								roomId: match.id,
							},
						})
					}
				/>
			))}
		</div>
	);
}
