import { cn } from "@/lib/utils";
import {
	CharacterElement,
	CharacterElementDetail,
	type CharacterElementEnum,
} from "@/lib/constants";

export const ELEMENT_FILTER_ALL = "all";
const ELEMENT_OPTIONS = Object.values(
	CharacterElement,
) as CharacterElementEnum[];

interface BanPickElementFilterProps {
	selectedElement: string;
	onSelect: (value: string) => void;
}

export default function BanPickElementFilter({
	selectedElement,
	onSelect,
}: BanPickElementFilterProps) {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<button
				type="button"
				onClick={() => onSelect(ELEMENT_FILTER_ALL)}
				className={cn(
					"h-8 rounded-md border px-2 text-xs transition-colors",
					selectedElement === ELEMENT_FILTER_ALL
						? "border-white bg-white/20 text-white"
						: "border-white/30 text-white/80 hover:bg-white/10",
				)}
			>
				All
			</button>
			{ELEMENT_OPTIONS.map((element) => {
				const detail = CharacterElementDetail[element];
				const isActive = selectedElement === detail.key;

				return (
					<button
						key={detail.key}
						type="button"
						onClick={() => onSelect(detail.key)}
						className={cn(
							"h-8 w-8 rounded-md border p-1 transition-colors",
							isActive
								? "border-white bg-white/20"
								: "border-white/30 hover:bg-white/10",
						)}
						title={detail.name}
						aria-label={detail.name}
					>
						<img
							src={detail.iconUrl}
							alt={detail.name}
							className="h-full w-full object-contain"
						/>
					</button>
				);
			})}
		</div>
	);
}
