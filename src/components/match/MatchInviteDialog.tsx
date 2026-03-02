import { Button } from "../ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import {
	SelectInput,
	SelectInputContent,
	SelectInputEmpty,
	SelectInputOption,
} from "../select-input";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import type { BaseApiResponse } from "@/lib/types";
import type { ProfileResponse } from "@/apis/self/types";
import { Avatar, AvatarImage } from "../ui/avatar";
import { matchApi } from "@/apis/match";
import { toast } from "sonner";

export interface MatchInviteDialogProps {
	matchId: string;
}

export default function MatchInviteDialog({
	matchId: _matchId,
}: MatchInviteDialogProps) {
	const [open, setOpen] = useState(false);
	const [searchValue, setSearchValue] = useState("");
	const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
	const [selectedUser, setSelectedUser] = useState<ProfileResponse | null>(
		null,
	);
	const [errorMsg, setErrorMsg] = useState("");

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			setDebouncedSearchValue(searchValue.trim());
		}, 500);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [searchValue]);

	const findUserByUniqueKeyQuery = useQuery({
		queryKey: ["findUserByUniqueKey", debouncedSearchValue],
		queryFn: async () => {
			if (!debouncedSearchValue) return null;
			const res = await http.get<BaseApiResponse<ProfileResponse>>(
				"/api/user/find-by-unique-key?key=" +
					encodeURIComponent(debouncedSearchValue),
			);
			return res.data.data ?? null;
		},
		enabled: Boolean(debouncedSearchValue),
		retry: 0,
		staleTime: 30_000,
	});
	const foundUser = findUserByUniqueKeyQuery.data;

	const handleSearchChange = (value: string) => {
		setSearchValue(value);
		setErrorMsg("");

		if (
			selectedUser &&
			value !== selectedUser.displayName &&
			value !== selectedUser.ingameUuid
		) {
			setSelectedUser(null);
		}
	};

	const handleSelectUser = () => {
		if (!foundUser) {
			return;
		}

		setSelectedUser(foundUser);
		setSearchValue(foundUser.displayName);
		setErrorMsg("");
	};

	const inviteToMatchMutation = useMutation({
		mutationFn: matchApi.inviteToMatch,
		onSuccess: () => {
			toast.success("Invite sent successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to send invite");
		},
		onSettled: () => {
			setOpen(false);
		},
	});
	const handleSendInvite = async () => {
		const inviteTargetUser = selectedUser ?? foundUser;

		if (!inviteTargetUser) {
			setErrorMsg("User not found");
			return;
		}
		inviteToMatchMutation.mutate({
			accountId: inviteTargetUser.id,
			matchId: _matchId,
		});
		setErrorMsg("");
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Invite</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Invite Player</DialogTitle>
					{errorMsg && (
						<DialogDescription className="text-destructive">
							{errorMsg}
						</DialogDescription>
					)}
				</DialogHeader>

				<div>
					<SelectInput
						value={searchValue}
						onValueChange={handleSearchChange}
						placeholder="Search player..."
					>
						<SelectInputContent>
							{findUserByUniqueKeyQuery.isFetching ? (
								<SelectInputEmpty title="Searching..." />
							) : foundUser ? (
								<SelectInputOption
									value={foundUser.id}
									onSelect={handleSelectUser}
									className="flex gap-2 items-center"
								>
									<Avatar size="sm">
										<AvatarImage src={foundUser.avatar} />
									</Avatar>
									<span>{foundUser.displayName}</span>
								</SelectInputOption>
							) : debouncedSearchValue ? (
								<SelectInputEmpty />
							) : null}
						</SelectInputContent>
					</SelectInput>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
					<Button onClick={handleSendInvite}>Send</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
