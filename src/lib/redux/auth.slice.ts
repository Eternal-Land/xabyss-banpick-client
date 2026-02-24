import type { ProfileResponse } from "@/apis/self/types";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from ".";

export interface AuthState {
	profile?: ProfileResponse;
}

const initialState: AuthState = {};

export const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setProfile: (state, action: PayloadAction<ProfileResponse | undefined>) => {
			state.profile = action.payload;
		},
	},
});

export const { setProfile } = authSlice.actions;

export const selectAuthProfile = (state: RootState) => state.auth.profile;

export default authSlice.reducer;
