import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeaponCostMilestonesTab from "@/components/weapon-cost-milestones";
import { createFileRoute } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import z from "zod";

const weaponCostsSearchSchema = z.object({
	tab: fallback(
		z.enum(["weapon-costs", "weapon-cost-milestones"]),
		"weapon-costs",
	),
});

export const Route = createFileRoute("/admin/weapon-costs/")({
	component: RouteComponent,
	validateSearch: zodValidator(weaponCostsSearchSchema),
});

function RouteComponent() {
	const { tab } = Route.useSearch();
	const navigate = Route.useNavigate();

	return (
		<Tabs value={tab} onValueChange={(v) => navigate({ search: { tab: v } })}>
			<TabsList>
				<TabsTrigger value="weapon-costs">Weapon Cost</TabsTrigger>
				<TabsTrigger value="weapon-cost-milestones">
					Weapon Cost Milestones
				</TabsTrigger>
			</TabsList>
			<TabsContent value="weapon-costs">
				<div>test</div>
			</TabsContent>
			<TabsContent value="weapon-cost-milestones">
				<WeaponCostMilestonesTab />
			</TabsContent>
		</Tabs>
	);
}
