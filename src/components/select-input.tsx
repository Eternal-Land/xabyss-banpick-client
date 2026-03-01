import { useEffect, useState } from "react";
import { Input } from "./ui/input";

export interface SelectInputOption {
    label: string;
    value: string;
}

export interface SelectInputProps {
    placeholder?: string;
    options?: SelectInputOption[];
    value?: string;
    onValueChange?: (value?: string) => void;
    onSelect?: (option: SelectInputOption) => void;
    emptyComponent?: React.ReactNode;
}

export default function SelectInput({
    placeholder,
    options,
    value,
    onValueChange,
    onSelect,
    emptyComponent = <div className="px-10 py-5">No options found</div>
}: SelectInputProps) {
    const [open, setOpen] = useState(false);
    const [localValue, setLocalValue] = useState(value);
    const [localOptions, setLocalOptions] = useState<SelectInputOption[] | undefined>(options);

    useEffect(() => {
        const filteredOptions = options?.filter((option) => option.label.toLowerCase().includes(localValue?.toLowerCase() || ""));
        setLocalOptions(filteredOptions);
    }, [localValue, options]);

    return (
        <div className="relative">
            <Input
                placeholder={placeholder}
                value={localValue}
                className="relative"
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                onChange={(e) => {
                    setLocalValue(e.target.value);
                    onValueChange?.(e.target.value);
                }} />
            {open && (
                <div className={"absolute bg-popover text-popover-foreground p-1 rounded-md min-w-32"}>
                    {localOptions?.length ? localOptions.map((option) => (
                        <div
                            key={option.value}
                            className="px-2 py-1.5 hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-sm text-sm"
                            onClick={() => onSelect?.(option)}
                        >
                            {option.label}
                        </div>
                    )) : emptyComponent}
                </div>
            )}
        </div>
    )
}