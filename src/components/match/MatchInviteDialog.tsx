import { ChevronsUpDownIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "../ui/command";
import { useState } from "react";
import type { ProfileResponse } from "@/apis/self/types";
import { useDebounce } from "@/hooks/use-debounce";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/apis/users";
import { http } from "@/lib/http";
import type { BaseApiResponse } from "@/lib/types";

export interface MatchInviteDialogProps {
	matchId: string;
}

export default function MatchInviteDialog({ matchId }: MatchInviteDialogProps) {
	const [search, setSearch] = useState("");

	const searchUserQuery = useQuery({
		queryKey: ["searchUser"],
		queryFn: async () => {
			if (!search.trim()) return undefined;
			const response = await http.get<BaseApiResponse<ProfileResponse>>(
				`/api/user/find-by-unique-key?key=${search}`,
			);
			return response.data;
		},
		enabled: false,
	});

	const triggerSearchQuery = useDebounce(() => {
		searchUserQuery.refetch();
	}, 500);

	const handleSearchChange = (value: string) => {
		setSearch(value);
		triggerSearchQuery();
	};

	const foundUser = searchUserQuery.data?.data;

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>Invite</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Invite Player</DialogTitle>
				</DialogHeader>

				<div>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className="w-full justify-between"
								aria-label="Select player"
							>
								<span>Select player</span>
								<ChevronsUpDownIcon className="opacity-50" />
							</Button>
						</PopoverTrigger>

						<PopoverContent align="start">
							<Command>
								<CommandInput
									placeholder="Input uuid or email"
									value={search}
									onValueChange={handleSearchChange}
								/>
								<CommandList>
									<CommandEmpty>No player found.</CommandEmpty>
									{foundUser && (
										<CommandGroup>
											<CommandItem value={foundUser.ingameUuid}>
												{foundUser.displayName}
											</CommandItem>
										</CommandGroup>
									)}
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
					<Button>Send</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
