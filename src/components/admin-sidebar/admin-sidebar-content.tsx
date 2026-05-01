import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
	BriefcaseIcon,
	ChartCandlestick,
	ChartScatterIcon,
	ContactIcon,
	HouseIcon,
	SparklesIcon,
	SwordIcon,
	UsersIcon,
	WrenchIcon,
	Link2Icon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { adminLocaleKeys } from "@/i18n/keys";
import { getTranslationToken } from "@/i18n/namespaces";

type AdminSidebarRouteGroup = {
	label: string;
	routes: AdminSidebarRoute[];
};

type AdminSidebarRoute = {
	to: string;
	label: string;
	icon: ReactNode;
};

const adminRouteGroups: AdminSidebarRouteGroup[] = [
	{
		label: getTranslationToken("admin", adminLocaleKeys.admin_sidebar_label),
		routes: [
			{
				to: "/admin",
				label: getTranslationToken(
					"admin",
					adminLocaleKeys.admin_sidebar_dashboard,
				),
				icon: <HouseIcon className="size-4" />,
			},
			{
				to: "/admin/permissions",
				label: getTranslationToken(
					"admin",
					adminLocaleKeys.admin_sidebar_permissions,
				),
				icon: <WrenchIcon className="size-4" />,
			},
			{
				to: "/admin/staff-roles",
				label: getTranslationToken(
					"admin",
					adminLocaleKeys.admin_sidebar_staff_roles,
				),
				icon: <BriefcaseIcon className="size-4" />,
			},
			{
				to: "/admin/staffs",
				label: getTranslationToken(
					"admin",
					adminLocaleKeys.admin_sidebar_staffs,
				),
				icon: <ContactIcon className="size-4" />,
			},
			{
				to: "/admin/users",
				label: getTranslationToken(
					"admin",
					adminLocaleKeys.admin_sidebar_users,
				),
				icon: <UsersIcon className="size-4" />,
			},
		],
	},
	{
		label: getTranslationToken(
			"admin",
			adminLocaleKeys.admin_sidebar_match_settings,
		),
		routes: [
			{
				to: "/admin/characters",
				label: getTranslationToken(
					"admin",
					adminLocaleKeys.admin_sidebar_characters,
				),
				icon: <SparklesIcon className="size-4" />,
			},
			{
				to: "/admin/weapons",
				label: getTranslationToken(
					"admin",
					adminLocaleKeys.admin_sidebar_weapons,
				),
				icon: <SwordIcon className="size-4" />,
			},
			{
				to: "/admin/costs",
				label: getTranslationToken(
					"admin",
					adminLocaleKeys.admin_sidebar_character_costs,
				),
				icon: <ChartScatterIcon className="size-4" />,
			},
			{
				to: "/admin/weapon-costs",
				label: getTranslationToken(
					"admin",
					adminLocaleKeys.admin_sidebar_weapon_costs,
				),
				icon: <ChartCandlestick className="size-4" />,
			},
			{
				to: "/admin/character-weapons",
				label: getTranslationToken(
					"admin",
					adminLocaleKeys.admin_sidebar_character_weapons,
				),
				icon: <Link2Icon className="size-4" />,
			},
		],
	},
];

export default function AdminSidebarContent() {
	const { t } = useTranslation();
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});

	const isRouteActive = (to: string) => {
		if (to === "/admin") {
			return pathname === "/admin";
		}

		return pathname.startsWith(to);
	};

	return (
		<SidebarContent>
			{adminRouteGroups.map((group) => (
				<SidebarGroup key={group.label}>
					<SidebarGroupLabel>{t(group.label)}</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{group.routes.map((route) => (
								<SidebarMenuItem key={route.to}>
									<SidebarMenuButton asChild isActive={isRouteActive(route.to)}>
										<Link to={route.to}>
											{route.icon} {t(route.label)}
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			))}
		</SidebarContent>
	);
}
