import type { BaseApiResponse } from "@/lib/types";
import axios from "axios";
import type { ProfileResponse, UpdateProfileInput } from "./types";
import { API_BASE, http } from "@/lib/http";

axios.defaults.withCredentials = true;

async function getSelf() {
	const response = await axios.get<BaseApiResponse<ProfileResponse>>(
		API_BASE + "/api/self",
	);
	return response.data;
}

async function updateProfile(input: UpdateProfileInput) {
	const response = await http.put<BaseApiResponse>("/api/self", input);
	return response.data;
}

export const selfApi = {
	getSelf,
	updateProfile,
} as const;
