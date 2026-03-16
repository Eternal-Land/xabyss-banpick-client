import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export const RARITY_FILTER_ALL = "all";

interface BanPickRarityFilterProps {
	selectedRarity: string;
	onSelect: (value: string) => void;
}

export default function BanPickRarityFilter({
	selectedRarity,
	onSelect,
}: BanPickRarityFilterProps) {
	return (
		<div className="flex items-center gap-2">
			<button
				type="button"
				onClick={() => onSelect(RARITY_FILTER_ALL)}
				className={cn(
					"h-8 rounded-md border px-2 text-xs transition-colors",
					selectedRarity === RARITY_FILTER_ALL
						? "border-white bg-white/20 text-white"
						: "border-white/30 text-white/80 hover:bg-white/10",
				)}
			>
				All
			</button>

			{[5, 4].map((rarity) => {
				const value = rarity.toString();
				const isActive = selectedRarity === value;

				return (
					<button
						key={value}
						type="button"
						onClick={() => onSelect(value)}
						className={cn(
							"h-8 rounded-md border px-2 text-xs transition-colors flex items-center gap-1",
							isActive
								? "border-sky-400 bg-sky-400/15 text-sky-300"
								: "border-white/30 text-white/80 hover:bg-white/10",
						)}
						aria-label={`${rarity} star`}
					>
						<Star
							className={cn(
								"h-3.5 w-3.5 fill-current",
								rarity === 5 ? "text-orange-400" : "text-purple-600",
							)}
						/>
					</button>
				);
			})}
		</div>
	);
}
