import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import {
    Mail,
    Lock,
    Compass,
    Bus,
    ShieldCheck,
    Users,
    Activity,
    MapPin,
} from 'lucide-react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import AppLogoIcon from '@/components/app-logo-icon';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

function TransitSchemaMap() {
    return (
        <div className="relative flex h-72 w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 shadow-inner">
            <style>{`
                @keyframes dash {
                    to {
                        stroke-dashoffset: -200;
                    }
                }
            `}</style>

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] bg-[size:1.5rem_1.5rem] opacity-40"></div>

            {/* Animated Transit Lines */}
            <svg
                className="absolute inset-0 z-0 h-full w-full p-4"
                viewBox="0 0 400 240"
            >
                {/* Route 1: Indigo */}
                <path
                    d="M 40,120 Q 120,40 200,120 T 360,120"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.25"
                />
                <path
                    d="M 40,120 Q 120,40 200,120 T 360,120"
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="12 180"
                    style={{ animation: 'dash 6s linear infinite' }}
                />

                {/* Route 2: Emerald */}
                <path
                    d="M 60,60 H 340 V 180 H 60 Z"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.2"
                />
                <path
                    d="M 60,60 H 340 V 180 H 60 Z"
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="15 220"
                    style={{
                        animation: 'dash 8s linear infinite',
                        animationDirection: 'reverse',
                    }}
                />

                {/* Connection Nodes / Stations */}
                <g fill="#020617" stroke="#6366f1" strokeWidth="2">
                    <circle cx="40" cy="120" r="5.5" />
                    <circle cx="200" cy="120" r="5.5" />
                    <circle cx="360" cy="120" r="5.5" />
                </g>
                <g fill="#020617" stroke="#10b981" strokeWidth="2">
                    <circle cx="60" cy="60" r="5.5" />
                    <circle cx="340" cy="60" r="5.5" />
                    <circle cx="340" cy="180" r="5.5" />
                    <circle cx="60" cy="180" r="5.5" />
                </g>

                {/* Moving Bus / Node highlights */}
                <circle
                    cx="200"
                    cy="120"
                    r="8"
                    fill="#6366f1"
                    className="animate-ping opacity-30"
                />
                <circle cx="200" cy="120" r="4.5" fill="#6366f1" />

                <circle
                    cx="60"
                    cy="60"
                    r="8"
                    fill="#10b981"
                    className="animate-ping opacity-30"
                />
                <circle cx="60" cy="60" r="4.5" fill="#10b981" />
            </svg>

            {/* Live Legend */}
            <div className="absolute right-4 bottom-4 left-4 z-10 flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/90 px-4 py-2.5 text-xs shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] font-semibold tracking-wide text-slate-300 uppercase">
                        SHYAMOLI LINE LIVE
                    </span>
                </div>
                <span className="font-medium text-slate-400">ETA: 4 mins</span>
            </div>
        </div>
    );
}

export default function Login({ status, canResetPassword }: Props) {
    const [activeRole, setActiveRole] = useState<
        'student' | 'driver' | 'admin'
    >(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab === 'driver' || tab === 'admin' || tab === 'student') {
            return tab;
        }
        return 'student';
    });

    return (
        <div className="grid min-h-dvh bg-background lg:grid-cols-2">
            <Head title="Log in" />

            {/* Left Column: Visual Hero Side (Hidden on Mobile) */}
            <div className="relative hidden flex-col justify-between overflow-hidden border-r border-slate-900 bg-slate-950 p-12 text-white lg:flex">
                {/* Radial Gradient overlay for glow */}
                <div className="pointer-events-none absolute top-0 left-0 z-0 h-full w-full bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.08),transparent_50%)]" />

                {/* Header Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/25 bg-indigo-500/10 text-indigo-400">
                        <AppLogoIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-base font-bold tracking-tight text-transparent">
                            NUB Transit
                        </h2>
                        <p className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">
                            Smart Campus Shuttle
                        </p>
                    </div>
                </div>

                {/* Animated Map Visual & Stats */}
                <div className="relative z-10 my-auto flex max-w-xl flex-col gap-8 mx-auto">
                    <div className="space-y-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-indigo-400 uppercase">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
                            Transit Control Center
                        </span>
                        <h1 className="text-3xl leading-tight font-extrabold tracking-tight">
                            Smart Transportation for Campus Mobility.
                        </h1>
                        <p className="text-sm leading-relaxed text-slate-400">
                            Monitor routes, track arrival timetables, and manage
                            assigned fleet schedules across all campuses.
                        </p>
                    </div>

                    <TransitSchemaMap />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur-sm">
                            <div className="mb-1.5 flex items-center gap-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                <Activity className="h-3.5 w-3.5 text-emerald-400" />
                                Active Fleet
                            </div>
                            <div className="text-2xl font-bold tracking-tight">
                                12 Buses
                            </div>
                            <p className="mt-1 text-[10px] font-medium text-slate-500">
                                Actively broadcasting GPS
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur-sm">
                            <div className="mb-1.5 flex items-center gap-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                                Active Routes
                            </div>
                            <div className="text-2xl font-bold tracking-tight">
                                4 Routes
                            </div>
                            <p className="mt-1 text-[10px] font-medium text-slate-500">
                                Connecting main stops
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer branding */}
                <div className="relative z-10 text-xs font-medium text-slate-500">
                    Northern University Bangladesh • Smart Campus Transport
                    System
                </div>
            </div>

            {/* Right Column: Authentication Card Form */}
            <div className="relative flex flex-col items-center justify-center overflow-y-auto p-6 md:p-12">
                <div className="flex w-full max-w-[400px] flex-col gap-8 py-8">
                    {/* Header showing on smaller devices */}
                    <div className="flex flex-col items-center gap-2 text-center lg:items-start lg:text-left">
                        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50 text-indigo-600 lg:hidden dark:border-indigo-900/30 dark:bg-indigo-950/40 dark:text-indigo-400">
                            <AppLogoIcon className="h-7 w-7" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Welcome to NUB Transit
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Sign in to your campus transit account
                        </p>
                    </div>

                    {/* Role Tab Selector */}
                    <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
                        <button
                            type="button"
                            onClick={() => setActiveRole('student')}
                            className={`flex flex-col items-center justify-center rounded-lg px-1 py-2 text-xs font-semibold tracking-wide transition-all ${
                                activeRole === 'student'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                            }`}
                        >
                            <Users className="mb-1 h-4 w-4" />
                            Student
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveRole('driver')}
                            className={`flex flex-col items-center justify-center rounded-lg px-1 py-2 text-xs font-semibold tracking-wide transition-all ${
                                activeRole === 'driver'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                            }`}
                        >
                            <Bus className="mb-1 h-4 w-4" />
                            Driver
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveRole('admin')}
                            className={`flex flex-col items-center justify-center rounded-lg px-1 py-2 text-xs font-semibold tracking-wide transition-all ${
                                activeRole === 'admin'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                            }`}
                        >
                            <ShieldCheck className="mb-1 h-4 w-4" />
                            Admin
                        </button>
                    </div>

                    {/* Role Context Details */}
                    <div className="flex gap-3 rounded-2xl border border-indigo-100/50 bg-indigo-50/50 p-4 text-xs leading-relaxed transition-all dark:border-indigo-900/20 dark:bg-indigo-950/15">
                        {activeRole === 'student' && (
                            <>
                                <Compass className="h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                                <div className="text-muted-foreground">
                                    <strong className="mb-0.5 block text-foreground">
                                        Student Dashboard
                                    </strong>
                                    Track bus routes in real-time, view stops,
                                    and check arrival timetables.
                                </div>
                            </>
                        )}
                        {activeRole === 'driver' && (
                            <>
                                <Bus className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                <div className="text-muted-foreground">
                                    <strong className="mb-0.5 block text-foreground">
                                        Driver Portal
                                    </strong>
                                    Log in to start route trips, update stops.
                                </div>
                            </>
                        )}
                        {activeRole === 'admin' && (
                            <>
                                <ShieldCheck className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                                <div className="text-muted-foreground">
                                    <strong className="mb-0.5 block text-foreground">
                                        Administrator Console
                                    </strong>
                                    Manage routes, stops, buses, driver
                                    assignments, and log histories.
                                </div>
                            </>
                        )}
                    </div>

                    {/* Passkey authentication backend support */}
                    <PasskeyVerify separator="Or use password credentials" />

                    {/* Login Form */}
                    <Form
                        {...store.form()}
                        resetOnSuccess={['password']}
                        className="flex flex-col gap-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-5">
                                    {/* Email Input */}
                                    <div className="grid gap-1.5">
                                        <Label
                                            htmlFor="email"
                                            className="text-xs font-semibold text-foreground"
                                        >
                                            Email Address
                                        </Label>
                                        <div className="relative flex items-center">
                                            <Mail className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                placeholder={
                                                    activeRole === 'student'
                                                        ? 'student@nub.ac.bd'
                                                        : activeRole ===
                                                            'driver'
                                                          ? 'driver@nub.ac.bd'
                                                          : 'admin@nub.ac.bd'
                                                }
                                                className="h-10.5 rounded-xl border-input bg-background/50 pl-10 transition-colors focus:bg-background"
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>

                                    {/* Password Input */}
                                    <div className="grid gap-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label
                                                htmlFor="password"
                                                className="text-xs font-semibold text-foreground"
                                            >
                                                Password
                                            </Label>
                                            {canResetPassword && (
                                                <TextLink
                                                    href={request()}
                                                    className="text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
                                                    tabIndex={5}
                                                >
                                                    Forgot password?
                                                </TextLink>
                                            )}
                                        </div>
                                        <div className="relative flex items-center w-full">
                                            <Lock className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground" />
                                            <PasswordInput
                                                id="password"
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="••••••••"
                                                className="h-10.5 w-full rounded-xl border-input bg-background/50 pl-10 transition-colors focus:bg-background"
                                            />
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    {/* Remember Me checkbox */}
                                    <div className="flex items-center space-x-2.5">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            tabIndex={3}
                                            className="h-4.5 w-4.5 rounded-md border-input data-[state=checked]:border-indigo-600 data-[state=checked]:bg-indigo-600"
                                        />
                                        <Label
                                            htmlFor="remember"
                                            className="cursor-pointer text-xs font-medium text-muted-foreground select-none"
                                        >
                                            Keep me logged in
                                        </Label>
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="mt-2 h-11 w-full rounded-xl bg-indigo-600 font-semibold text-white shadow-md shadow-indigo-600/10 transition-all hover:bg-indigo-500 hover:shadow-indigo-600/20 active:scale-[0.98] dark:bg-indigo-500 dark:hover:bg-indigo-400"
                                        tabIndex={4}
                                        disabled={processing}
                                        data-test="login-button"
                                    >
                                        {processing && <Spinner />}
                                        {activeRole === 'student'
                                            ? 'Log in as Student'
                                            : activeRole === 'driver'
                                              ? 'Log in as Driver'
                                              : 'Log in as Administrator'}
                                    </Button>
                                </div>

                                <div className="mt-4 text-center text-xs text-muted-foreground">
                                    Don't have an account?{' '}
                                    <TextLink
                                        href={register()}
                                        className="font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
                                        tabIndex={5}
                                    >
                                        Create one now
                                    </TextLink>
                                </div>
                            </>
                        )}
                    </Form>

                    {status && (
                        <div className="mt-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-center text-xs font-semibold text-emerald-600 dark:border-emerald-900/20 dark:bg-emerald-950/15 dark:text-emerald-400">
                            {status}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

Login.layout = null;
