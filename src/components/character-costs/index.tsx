import { useCallback, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { characterCostsApi } from "@/apis/character-costs";
import { LocaleKeys, type CharacterElementEnum } from "@/lib/constants";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import CharacterCostRow from "./CharacterCostRow";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { FilterIcon, Search } from "lucide-react";
import { useElementOptions } from "@/hooks/use-element-label";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import type { CharacterCostQuery } from "@/apis/character-costs/type";
import { useDebounce } from "@/hooks/use-debounce";

export default function CharacterCostsTab() {
    const { t } = useTranslation();
    const [filter, setFilter] = useState<CharacterCostQuery>({
        showInactive: false,
        element: undefined,
        search: "",
        limit: 50
    });
    const [search, setSearch] = useState("");
    const [hasSaved, setHasSaved] = useState(false);
    const elementOptions = useElementOptions()
    const updateCostMutation = useMutation({
        mutationFn: ({ costId, cost }: { costId: number; cost: number }) =>
            characterCostsApi.updateCharacterCost(costId, { cost }),
        onMutate: () => {
            setHasSaved(false);
        },
        onSuccess: () => {
            setHasSaved(true);
        },
        onError: () => {
            setHasSaved(false);
        },
    });

    const handleCommit = useCallback(
        (costId: number, value: number) => {
            updateCostMutation.mutate({ costId, cost: value });
        },
        [updateCostMutation],
    );

    const handleElementToggle = useCallback(
        (value: CharacterElementEnum, checked: boolean) => {
            setFilter((prev) => {
                const current = prev.element ?? [];
                const next = checked
                    ? [...current, value]
                    : current.filter((item) => item !== value);

                return {
                    ...prev,
                    element: next.length > 0 ? next : undefined,
                };
            });
        },
        [],
    );

    const handleStatusChange = useCallback((value: string) => {
        setFilter((prev) => ({
            ...prev,
            showInactive: value === "true",
        }));
    }, []);

    const listCharacterCostsQuery = useQuery({
        queryKey: ["listCharacterCosts", filter],
        queryFn: async () => {
            const data = [];
            let next = undefined;
            do {
                const res = await characterCostsApi.listCharacterCosts({ ...filter, startId: next })
                data.push(...(res.data || []));
                next = res.next;
            } while (next);
            return data;
        }
    });

    const triggerSearchChangeDebounce = useDebounce((value: string) => {
        setFilter((prev) => ({
            ...prev,
            search: value || undefined,
        }));
    }, 500);

    const handleSearchChange = (v: string) => {
        setSearch(v);
        triggerSearchChangeDebounce(v);
    }

    const syncMutation = useMutation({
        mutationFn: () => characterCostsApi.syncCharacterCostsWithCharacters(),
        onSuccess: () => {
            listCharacterCostsQuery.refetch();
        },
    });

    const isSaving = updateCostMutation.isPending;
    const saveMessage = isSaving
        ? t(LocaleKeys.character_costs_saving)
        : hasSaved
            ? t(LocaleKeys.character_costs_saved)
            : null;

    return <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
                <h1>{t(LocaleKeys.character_costs_title)}</h1>
                <InputGroup className="w-48">
                    <InputGroupInput placeholder={t(LocaleKeys.search_placeholder)} value={search} onChange={(e) => handleSearchChange(e.target.value)}  />
                    <InputGroupAddon>
                        <Search />
                    </InputGroupAddon>
                </InputGroup>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost"><FilterIcon className="size-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuGroup>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>{t(LocaleKeys.characters_table_element)}</DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                        {elementOptions.map((option) => {
                                            const elementValue = Number(option.value) as CharacterElementEnum;

                                            return (
                                            <DropdownMenuCheckboxItem
                                                key={option.value}
                                                checked={filter.element?.includes(elementValue) ?? false}
                                                onCheckedChange={(checked) =>
                                                    handleElementToggle(
                                                        elementValue,
                                                        Boolean(checked),
                                                    )
                                                }
                                            >
                                                {option.label}
                                            </DropdownMenuCheckboxItem>
                                            );
                                        })}
                                    </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>

                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>{t(LocaleKeys.characters_table_status)}</DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                        <DropdownMenuRadioGroup
                                            value={filter.showInactive ? "true" : "false"}
                                            onValueChange={handleStatusChange}
                                        >
                                            <DropdownMenuRadioItem value="true">
                                                {t(LocaleKeys.show_inactive_true)}
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="false">
                                                {t(LocaleKeys.show_inactive_false)}
                                            </DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="flex items-center gap-6">
                {saveMessage && (
                    <p className={isSaving ? "text-amber-600" : "text-green-600"}>
                        {saveMessage}
                    </p>
                )}
                <Button onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>{t(LocaleKeys.character_costs_sync)}</Button>
            </div>
        </div>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{t(LocaleKeys.character_costs_table_character)}</TableHead>
                    {Array.from({ length: 7 }).map((_, index) => (
                        <TableHead key={index} className="text-center w-15">C{index}</TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {listCharacterCostsQuery.isLoading
                    ? Array.from({ length: 6 }).map((_, index) => (
                        <TableRow key={`character-cost-skeleton-${index}`}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <Skeleton className="h-4 w-28" />
                                </div>
                            </TableCell>
                            {Array.from({ length: 7 }).map((_, costIndex) => (
                                <TableCell key={`character-cost-skeleton-${index}-${costIndex}`}>
                                    <Skeleton className="mx-auto h-8 w-15" />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))
                    : listCharacterCostsQuery.data?.map((character) => (
                        <CharacterCostRow
                            key={character.id}
                            character={character}
                            onCommit={handleCommit}
                        />
                    ))}
            </TableBody>
        </Table>
    </div>
}