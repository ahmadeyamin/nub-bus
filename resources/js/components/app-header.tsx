import { Link, usePage, router } from '@inertiajs/react';
import { ArrowLeft, Bus, ChevronDown, LayoutGrid, LogOut, MapPin, Menu, RouteIcon, Settings, User, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { dashboard, tracking } from '@/routes';
import { index as routesIndex } from '@/routes/admin/routes';
import { index as busesIndex } from '@/routes/admin/buses';
import { index as driversIndex } from '@/routes/admin/drivers';
import { index as driverStatusIndex } from '@/routes/driver/status';
import { logout } from '@/routes';
import { edit as profileEdit } from '@/routes/profile';

import { useState } from 'react';

const ROLE_COLORS: Record<string, string> = {
    admin: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    driver: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    student: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
};

function NavLink({ href, children, icon: Icon }: { href: string; children: React.ReactNode; icon?: React.ElementType }) {
    const { url } = usePage();
    const isActive = url === href || url.startsWith(href + '?');
    return (
        <Link
            href={href}
            className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white',
            )}
        >
            {Icon && <Icon className="h-4 w-4" />}
            {children}
        </Link>
    );
}

export function AppHeader() {
    const { auth } = usePage().props;
    const getInitials = useInitials();
    const role = auth.user?.role;
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        router.flushAll();
    };

    const adminLinks = [
        { href: routesIndex.url(), label: 'Routes', icon: RouteIcon },
        { href: busesIndex.url(), label: 'Buses', icon: Bus },
        { href: driversIndex.url(), label: 'Drivers', icon: User },
    ];

    const driverLinks = [
        { href: driverStatusIndex.url(), label: 'Driver Panel', icon: MapPin },
    ];

    const navLinks = role === 'admin' ? adminLinks : role === 'driver' ? driverLinks : [];

    return (
        <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">

                {/* Back button */}
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors flex-shrink-0"
                    title="Go back"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>

                {/* Logo */}
                <Link href={dashboard.url()} className="flex items-center gap-2.5 flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md shadow-indigo-500/20">
                        <Bus className="h-4 w-4 text-white" />
                    </div>
                    <div className="leading-tight">
                        <div className="text-sm font-extrabold text-gray-900 dark:text-white tracking-tight">NUB Transit</div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-medium -mt-0.5">Tracking System</div>
                    </div>
                </Link>

                {/* Desktop nav */}
                {navLinks.length > 0 && (
                    <nav className="hidden md:flex items-center gap-1 ml-4">
                        <NavLink href={dashboard.url()} icon={LayoutGrid}>Dashboard</NavLink>
                        {navLinks.map(link => (
                            <NavLink key={link.href} href={link.href} icon={link.icon}>{link.label}</NavLink>
                        ))}
                    </nav>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Live tracking link */}
                <Link
                    href={tracking.url()}
                    className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Tracking
                </Link>

                {/* User dropdown */}
                {auth.user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors outline-none">
                                <Avatar className="h-7 w-7">
                                    <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                    <AvatarFallback className="text-xs font-bold bg-indigo-600 text-white">
                                        {getInitials(auth.user.name ?? '')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden sm:block text-left">
                                    <div className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">{auth.user.name}</div>
                                    <div className={cn('text-[10px] font-medium px-1 rounded capitalize leading-tight mt-0.5 inline-block', ROLE_COLORS[role ?? 'student'])}>
                                        {role ?? 'student'}
                                    </div>
                                </div>
                                <ChevronDown className="h-3.5 w-3.5 text-gray-400 hidden sm:block" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuLabel className="pb-1">
                                <div className="text-sm font-semibold">{auth.user.name}</div>
                                <div className="text-xs text-gray-400 font-normal">{auth.user.email}</div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={profileEdit()} className="cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4" /> Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={logout()} as="button" className="cursor-pointer w-full text-red-600 dark:text-red-400 focus:text-red-600" onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" /> Log out
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                {/* Mobile menu toggle */}
                {navLinks.length > 0 && (
                    <button
                        className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setMobileOpen(o => !o)}
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                )}
            </div>

            {/* Mobile nav drawer */}
            {mobileOpen && navLinks.length > 0 && (
                <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3 space-y-1">
                    <NavLink href={dashboard.url()} icon={LayoutGrid}>Dashboard</NavLink>
                    {navLinks.map(link => (
                        <NavLink key={link.href} href={link.href} icon={link.icon}>{link.label}</NavLink>
                    ))}
                </div>
            )}
        </header>
    );
}
