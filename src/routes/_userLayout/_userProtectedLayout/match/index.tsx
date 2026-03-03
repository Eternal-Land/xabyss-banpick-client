import { matchApi } from "@/apis/match";
import { listMatchesQuerySchema, type ListMatchesQuery } from "@/apis/match/types";
import MatchContainer from "@/components/match/MatchContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useAppSelector } from "@/hooks/use-app-selector";
import { matchLocaleKeys } from "@/i18n/keys";
import { getTranslationToken } from "@/i18n/namespaces";
import { selectAuthProfile } from "@/lib/redux/auth.slice";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/_userLayout/_userProtectedLayout/match/",
)({
  component: RouteComponent,
  validateSearch: zodValidator(listMatchesQuerySchema),
})

function RouteComponent() {
  const { t } = useTranslation();
  const tMatch = (key: string) => t(getTranslationToken("match", key));
  const navigate = Route.useNavigate();
  const filter = Route.useSearch();
  const profile = useAppSelector(selectAuthProfile);
  const [search, setSearch] = useState(filter.search || "");

  const listMatchesQuery = useQuery({
    queryKey: ["matches", filter, profile?.id],
    queryFn: () =>
      matchApi.listMatches({
        ...filter,
        accountId: profile?.id,
      }),
  });

  const handleFilterChange = (newFilter: ListMatchesQuery) => {
    navigate({
      replace: true,
      search: newFilter,
    });
  };

  const triggerSearchDebounce = useDebounce((value: string) => {
    handleFilterChange({
      ...filter,
      page: 1,
      search: value,
    });
  }, 500);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    triggerSearchDebounce(value);
  };

  useEffect(() => {
    setSearch(filter.search || "");
  }, [filter.search]);

  useEffect(() => {
    if (!listMatchesQuery.error) {
      return;
    }

    toast.error(
      listMatchesQuery.error.message ||
      t(getTranslationToken("match", matchLocaleKeys.match_list_load_error)),
    );
  }, [listMatchesQuery.error, t]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/30 p-4 backdrop-blur sm:flex-row sm:items-center">
        <Input
          placeholder={tMatch(matchLocaleKeys.match_list_search_placeholder)}
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
        />
        <div className="flex gap-2 sm:ml-auto">
          <Button variant="outline" onClick={() => navigate({ to: "/match/create" })}>{tMatch(matchLocaleKeys.match_list_create_button)}</Button>
        </div>
      </div>

      {listMatchesQuery.isLoading && <p>{tMatch(matchLocaleKeys.match_list_loading)}</p>}

      {!listMatchesQuery.isLoading &&
        (listMatchesQuery.data?.data?.length ?? 0) === 0 && (
          <p>{tMatch(matchLocaleKeys.match_list_empty)}</p>
        )}

      {listMatchesQuery.data?.data?.map((match) => (
        <MatchContainer
          key={match.id}
          matchTitle={match.name}
          player1={{
            name: match.participants?.[0]?.displayName || tMatch(matchLocaleKeys.match_list_waiting_player),
            uid: match.participants?.[0]?.ingameUuid || "-",
            avatarUrl:
              match.participants?.[0]?.avatar ||
              "https://res.cloudinary.com/dphtvhtvf/image/upload/v1770611732/genshin-impact-banpick/upload/avatars/euhhui4znfpssjw8laps.jpg",
          }}
          player2={{
            name: match.participants?.[1]?.displayName || tMatch(matchLocaleKeys.match_list_waiting_player),
            uid: match.participants?.[1]?.ingameUuid || "-",
            avatarUrl:
              match.participants?.[1]?.avatar ||
              "https://res.cloudinary.com/dphtvhtvf/image/upload/v1770611732/genshin-impact-banpick/upload/avatars/euhhui4znfpssjw8laps.jpg",
          }}
          onClick={() => navigate({ 
            to: '/room/$roomId/waiting', 
            params: {
              roomId: match.id,
            }
          })}
        />
      ))}
    </div>
  )
}
