import { weaponCostsApi } from "@/apis/weapon-costs";
import type { WeaponCostResponseItem } from "@/apis/weapon-costs/types";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import WeaponCostInputCell from "@/components/weapon-cost/weapon-cost-input-cell";
import { Skeleton } from "@/components/ui/skeleton";
import { useWeaponRarityOptions } from "@/hooks/use-weapon-rarity-label";
import { weaponCostsLocaleKeys } from "@/i18n/keys";
import { getTranslationToken } from "@/i18n/namespaces";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export const Route = createFileRoute("/admin/weapon-costs/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { t } = useTranslation();
	const [hasSaved, setHasSaved] = useState(false);
	const weaponRarityOptions = useWeaponRarityOptions().sort(
		(a, b) => Number(b.value) - Number(a.value),
	);
	const listWeaponCostsQuery = useQuery({
		queryKey: ["listWeaponCosts"],
		queryFn: weaponCostsApi.listWeaponCosts,
	});
	const updateWeaponCostMutation = useMutation({
		mutationFn: async (item: WeaponCostResponseItem) =>
			weaponCostsApi.updateWeaponCost(item.id, {
				value: item.value,
				unit: item.unit,
			}),
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

	const isSaving = updateWeaponCostMutation.isPending;
	const saveMessage = isSaving
		? t(
				getTranslationToken(
					"weapon-costs",
					weaponCostsLocaleKeys.weapon_costs_saving,
				),
			)
		: hasSaved
			? t(
					getTranslationToken(
						"weapon-costs",
						weaponCostsLocaleKeys.weapon_costs_saved,
					),
				)
			: null;

	return (
		<div>
			{saveMessage && (
				<div className="flex justify-start mb-2">
					<p className={isSaving ? "text-amber-600" : "text-green-600"}>
						{saveMessage}
					</p>
				</div>
			)}
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>
							{t(
								getTranslationToken(
									"weapon-costs",
									weaponCostsLocaleKeys.weapon_costs_upgrade_level,
								),
							)}
						</TableHead>
						{weaponRarityOptions.map((option) => (
							<TableHead key={option.value}>{option.label}</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{listWeaponCostsQuery.isLoading
						? Array.from({ length: 6 }).map((_, index) => (
								<TableRow key={`weapon-cost-skeleton-${index}`}>
									<TableCell>
										<Skeleton className="h-4 w-12" />
									</TableCell>
									{weaponRarityOptions.map((option) => (
										<TableCell
											key={`weapon-cost-skeleton-${index}-${option.value}`}
										>
											<Skeleton className="mx-auto h-8 w-15" />
										</TableCell>
									))}
								</TableRow>
							))
						: listWeaponCostsQuery.data?.data?.map((milestone) => (
								<TableRow key={milestone.upgradeLevel}>
									<TableCell>{milestone.upgradeLevel}</TableCell>
									{milestone.items.map((item) => (
										<WeaponCostInputCell
											key={item.id}
											data={item}
											onDataChange={(updatedData) => {
												updateWeaponCostMutation.mutate(updatedData);
											}}
										/>
									))}
								</TableRow>
							))}
				</TableBody>
			</Table>
		</div>
	);
}
