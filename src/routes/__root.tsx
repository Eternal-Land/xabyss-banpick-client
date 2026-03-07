import { selfApi } from "@/apis/self";
import NotificationHandler from "@/components/notification-handler";
import PlayerSideBackground from "@/components/player-side/background";
import Providers from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { store } from "@/lib/redux";
import { setProfile } from "@/lib/redux/auth.slice";
import type { QueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";

export interface RootRouteContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RootRouteContext>()({
	component: RootComponent,
	beforeLoad: async () => {
		const { profile } = store.getState().auth;
		if (!profile) {
			try {
				const response = await selfApi.getSelf();
				const fetchedProfile = response.data;
				store.dispatch(setProfile(fetchedProfile!));
			} catch (err) {
				console.log("Fetch profile failed in root route:", err);
			}
		}
	},
});

function RootComponent() {
	return (
		<Providers>
			<Outlet />
			<Toaster position="top-center" richColors />
			<PlayerSideBackground />
			<NotificationHandler />
		</Providers>
	);
}
