import { Link } from '@inertiajs/react';
import { Bus, LayoutGrid, MapPin, RouteIcon, User } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as routesIndex } from '@/routes/admin/routes';
import { index as driversIndex } from '@/routes/admin/drivers';
import { index as busesIndex } from '@/routes/admin/buses';
import { index as driverStatusIndex } from '@/routes/driver/status';
import type { NavItem } from '@/types';

import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

export function AppSidebar() {
    const { auth } = usePage<PageProps>().props;
    const role = auth.user?.role;

    const dynamicNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard.url(),
            icon: LayoutGrid,
        },
    ];

    if (role === 'admin') {
        dynamicNavItems.push({
            title: 'Routes',
            href: routesIndex.url(),
            icon: RouteIcon,
        });
        dynamicNavItems.push({
            title: 'Buses',
            href: busesIndex.url(),
            icon: Bus,
        });
        dynamicNavItems.push({
            title: 'Drivers',
            href: driversIndex.url(),
            icon: User,
        });
    } else if (role === 'driver') {
        dynamicNavItems.push({
            title: 'Driver Panel',
            href: driverStatusIndex.url(),
            icon: MapPin,
        });
    }

    const mainNavItems = dynamicNavItems;

    const footerNavItems: NavItem[] = [];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard.url()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
