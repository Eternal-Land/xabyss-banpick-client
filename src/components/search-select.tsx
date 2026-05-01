import { useMemo, useState } from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface SearchSelectOption {
	value: string;
	label: string;
}

export interface SearchSelectProps {
	options: SearchSelectOption[];
	value?: string;
	onValueChange: (value: string) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyText?: string;
	disabled?: boolean;
	className?: string;
	triggerClassName?: string;
	contentClassName?: string;
	ariaLabel?: string;
}

export default function SearchSelect({
	options,
	value,
	onValueChange,
	placeholder = "Select an option...",
	searchPlaceholder = "Search...",
	emptyText = "No results found.",
	disabled,
	className,
	triggerClassName,
	contentClassName,
	ariaLabel,
}: SearchSelectProps) {
	const [open, setOpen] = useState(false);

	const selectedOption = useMemo(
		() => options.find((option) => option.value === value),
		[options, value],
	);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="outline"
					role="combobox"
					aria-expanded={open}
					aria-label={ariaLabel ?? placeholder}
					disabled={disabled}
					className={cn("w-full justify-between", triggerClassName)}
				>
					{selectedOption ? (
						<span className="truncate">{selectedOption.label}</span>
					) : (
						<span className="text-muted-foreground truncate">{placeholder}</span>
					)}
					<ChevronsUpDownIcon className="size-4 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className={cn("w-(--radix-popper-anchor-width) p-0", className, contentClassName)}>
				<Command>
					<CommandInput placeholder={searchPlaceholder} />
					<CommandList>
						<CommandEmpty>{emptyText}</CommandEmpty>
						<CommandGroup>
							{options.map((option) => (
								<CommandItem
									key={option.value}
									value={option.label}
									onSelect={() => {
										onValueChange(option.value);
										setOpen(false);
									}}
								>
									<span className="truncate">{option.label}</span>
									<CheckIcon
										className={cn(
											"ml-auto size-4",
											value === option.value ? "opacity-100" : "opacity-0",
										)}
									/>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}