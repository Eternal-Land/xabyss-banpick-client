import { useWeaponRarityOptions } from "@/hooks/use-weapon-rarity-label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../ui/table";
import { useQuery } from "@tanstack/react-query";
import { weaponCostMilestonesApi } from "@/apis/weapon-cost-milestones";
import WeaponCostMilestoneInputCell from "./weapon-cost-milestone-input-cell";

export default function WeaponCostMilestonesTab() {
	const weaponRarityOptions = useWeaponRarityOptions().sort(
		(a, b) => Number(b.value) - Number(a.value),
	);
	const listWeaponCostMilestonesQuery = useQuery({
		queryKey: ["listWeaponCostMilestones"],
		queryFn: weaponCostMilestonesApi.listWeaponCostMilestones,
	});

	return (
		<div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Upgrade Level</TableHead>
						{weaponRarityOptions.map((option) => (
							<TableHead key={option.value}>{option.label}</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{listWeaponCostMilestonesQuery.data?.data?.map((milestone) => (
						<TableRow key={milestone.upgradeLevel}>
							<TableCell>{milestone.upgradeLevel}</TableCell>
							{milestone.items.map((item) => (
								<WeaponCostMilestoneInputCell
									key={item.id}
									value={item.cost}
									milestoneId={item.id}
									onCommit={(milestoneId, value) => {}}
								/>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
