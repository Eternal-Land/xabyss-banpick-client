import { IconAssets } from "@/lib/constants/icon-assets";
import { cn } from "@/lib/utils";

interface PlayerInfo {
	id?: string;
	displayName?: string;
	ingameUuid?: string;
	avatar?: string;
}

interface SideCostInfo {
	totalCost?: number;
	milestoneCost?: number;
	constellationCost?: number;
	refinementCost?: number;
	levelCost?: number;
	timeBonusCost?: number;
}

interface BanPickPlayerInfoProps {
	side: "blue" | "red";
	player?: PlayerInfo;
	cost?: SideCostInfo;
}

const toCostNumber = (value: number | undefined) =>
	Number(value ?? 0).toFixed(2);

export default function BanPickPlayerInfo({
	side,
	player,
	cost,
}: BanPickPlayerInfoProps) {
	const isBlue = side === "blue";
	const textColorClass = isBlue ? "text-sky-400" : "text-red-600";

	return (
		<div className="col-span-3 flex flex-col items-center gap-4">
			<div
				className={cn(
					"flex h-full justify-center items-center gap-4",
					!isBlue && "flex-row-reverse",
				)}
			>
				<div className="w-20 h-20 rounded-full object-cover mt-4 flex items-center justify-center overflow-hidden">
					<img
						src={player?.avatar ?? IconAssets.EMPTY_CHARACTER_ICON}
						alt={`${side} Player Avatar`}
						className="w-full h-full"
					/>
				</div>

				<div className={cn("flex flex-col", !isBlue && "items-end")}>
					<span className={cn("text-xl mt-2", textColorClass)}>
						{player?.displayName ?? "-"}
					</span>
					<span className="text-sm mt-2">UID: {player?.ingameUuid ?? "-"}</span>
				</div>
			</div>

			<div className="flex flex-col bg-transparent bg-linear-45 from-white/5 to-white/10 backdrop-blur-md rounded-lg p-4 w-full items-center gap-2 justify-center border border-white">
				<div className="flex justify-between items-center gap-4 w-full">
					<h1 className="text-lg">Total cost: </h1>
					<span className={cn("text-lg font-bold", textColorClass)}>
						{toCostNumber(cost?.totalCost)}
					</span>
				</div>
				<div className="flex justify-between items-center gap-4 w-full">
					<h1 className="text-lg">Milestone cost: </h1>
					<span className={cn("text-lg font-bold", textColorClass)}>
						{toCostNumber(cost?.milestoneCost)}
					</span>
				</div>
				<div className="flex justify-between items-center gap-4 w-full">
					<h1 className="text-lg">Constellation: </h1>
					<span className={cn("text-lg font-bold", textColorClass)}>
						{toCostNumber(cost?.constellationCost)}
					</span>
				</div>
				<div className="flex justify-between items-center gap-4 w-full">
					<h1 className="text-lg">Refinement: </h1>
					<span className={cn("text-lg font-bold", textColorClass)}>
						{toCostNumber(cost?.refinementCost)}
					</span>
				</div>
				<div className="flex justify-between items-center gap-4 w-full">
					<h1 className="text-lg">Level: </h1>
					<span className={cn("text-lg font-bold", textColorClass)}>
						{toCostNumber(cost?.levelCost)}
					</span>
				</div>
				<div className="flex justify-between items-center gap-4 w-full">
					<h1 className="text-2xl text-yellow-400">Time bonus: </h1>
					<span className="text-2xl font-bold text-yellow-400">
						{toCostNumber(cost?.timeBonusCost)}
					</span>
				</div>
			</div>
		</div>
	);
}
