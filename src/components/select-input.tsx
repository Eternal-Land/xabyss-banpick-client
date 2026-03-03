import {
	createContext,
	useContext,
	useRef,
	useState,
	type ComponentProps,
	type KeyboardEvent,
	type PropsWithChildren,
	type ReactNode,
} from "react";
import { Input } from "./ui/input";
import { Popover, PopoverAnchor, PopoverContent } from "./ui/popover";
import { cn } from "@/lib/utils";

interface SelectInputContextValue {
	close: () => void;
	select: (value?: string) => void;
}

const SelectInputContext = createContext<SelectInputContextValue | null>(null);

export interface SelectInputProps
	extends
		PropsWithChildren,
		Omit<
			ComponentProps<typeof Input>,
			"value" | "defaultValue" | "onChange" | "className"
		> {
	placeholder?: string;
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	emptyComponent?: ReactNode;
	wrapperClassName?: string;
	inputClassName?: string;
}

export function SelectInput({
	placeholder,
	value,
	defaultValue,
	onValueChange,
	open,
	defaultOpen,
	onOpenChange,
	emptyComponent,
	children,
	wrapperClassName,
	inputClassName,
	...inputProps
}: SelectInputProps) {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const [localOpen, setLocalOpen] = useState(defaultOpen ?? false);
	const [localValue, setLocalValue] = useState(defaultValue ?? "");

	const isOpenControlled = open !== undefined;
	const isValueControlled = value !== undefined;
	const currentOpen = isOpenControlled ? open : localOpen;
	const currentValue = isValueControlled ? value : localValue;

	const setOpen = (nextOpen: boolean) => {
		if (!isOpenControlled) {
			setLocalOpen(nextOpen);
		}
		onOpenChange?.(nextOpen);
	};

	const selectValue = (nextValue?: string) => {
		if (nextValue !== undefined) {
			if (!isValueControlled) {
				setLocalValue(nextValue);
			}
			onValueChange?.(nextValue);
		}
		setOpen(false);
	};

	const hasChildren = Boolean(children);

	const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		inputProps.onKeyDown?.(e);

		if (e.defaultPrevented) {
			return;
		}

		if (e.key === "ArrowDown") {
			e.preventDefault();
			setOpen(true);
		}

		if (e.key === "Escape") {
			setOpen(false);
		}
	};

	return (
		<Popover open={currentOpen} onOpenChange={setOpen}>
			<PopoverAnchor asChild>
				<div ref={wrapperRef} className={cn("relative", wrapperClassName)}>
					<Input
						{...inputProps}
						placeholder={placeholder}
						value={currentValue}
						className={cn("relative w-full", inputClassName)}
						onFocus={(e) => {
							inputProps.onFocus?.(e);
							setOpen(true);
						}}
						onClick={(e) => {
							inputProps.onClick?.(e);
							setOpen(true);
						}}
						onKeyDown={handleInputKeyDown}
						onChange={(e) => {
							if (!isValueControlled) {
								setLocalValue(e.target.value);
							}
							onValueChange?.(e.target.value);
							setOpen(true);
						}}
					/>
				</div>
			</PopoverAnchor>

			{(hasChildren || emptyComponent) && (
				<PopoverContent
					align="start"
					sideOffset={4}
					className="w-(--radix-popover-trigger-width) min-w-32 p-0"
					onOpenAutoFocus={(e) => e.preventDefault()}
					onInteractOutside={(e) => {
						if (wrapperRef.current?.contains(e.target as Node)) {
							e.preventDefault();
						}
					}}
				>
					<SelectInputContext.Provider
						value={{
							close: () => setOpen(false),
							select: selectValue,
						}}
					>
						{hasChildren ? children : emptyComponent}
					</SelectInputContext.Provider>
				</PopoverContent>
			)}
		</Popover>
	);
}

export interface SelectInputContentProps extends PropsWithChildren {
	className?: string;
}

export function SelectInputContent({
	children,
	className,
}: SelectInputContentProps) {
	return (
		<div
			className={cn(
				"bg-popover text-popover-foreground rounded-md p-1",
				className,
			)}
		>
			{children}
		</div>
	);
}

export interface SelectInputOptionProps extends PropsWithChildren {
	value?: string;
	onSelect?: (value?: string) => void;
	className?: string;
}

export function SelectInputOption({
	children,
	value,
	onSelect,
	className,
}: SelectInputOptionProps) {
	const context = useContext(SelectInputContext);

	return (
		<div
			role="option"
			tabIndex={0}
			className={cn(
				"px-2 py-1.5 hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-sm text-sm",
				className,
			)}
			onMouseDown={(e) => {
				e.preventDefault();
			}}
			onClick={() => {
				if (onSelect) {
					onSelect(value);
					context?.close();
					return;
				}

				context?.select(value);
			}}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					if (onSelect) {
						onSelect(value);
						context?.close();
						return;
					}

					context?.select(value);
				}
			}}
		>
			{children}
		</div>
	);
}

export interface SelectInputEmptyProps {
	title?: string;
}

export function SelectInputEmpty({
	title = "No results found",
}: SelectInputEmptyProps) {
	return <div className="px-10 py-5">{title}</div>;
}
