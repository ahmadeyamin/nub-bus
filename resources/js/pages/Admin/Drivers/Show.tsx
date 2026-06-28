import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useRef, useState } from 'react';
import {
    ArrowLeft,
    Bus,
    Camera,
    CheckCircle,
    Clock,
    CreditCard,
    Flag,
    KeyRound,
    Lock,
    Mail,
    MapPin,
    Pencil,
    Phone,
    Save,
    TrendingUp,
    User,
    X,
} from 'lucide-react';
import { index as driversIndex, update as driversUpdate } from '@/routes/admin/drivers';

interface BusInfo {
    id: number;
    name: string;
    is_active: boolean;
    status: string;
    trip_status: string;
    trips_completed: number;
    stops_reached_this_trip: number;
    trip_started_at: string | null;
    trip_duration_minutes: number | null;
    current_stop: string | null;
    route: { name: string; total_stops: number };
}

interface DriverType {
    id: number;
    name: string;
    email: string;
    avatar_url: string | null;
    nid_number: string | null;
    phone: string | null;
    profile_locked: boolean;
}

// ── Live timer ──────────────────────────────────────────────────────────────
function useLiveTimer(startedAt: string | null, active: boolean) {
    const [elapsed, setElapsed] = useState('—');
    useEffect(() => {
        if (!startedAt || !active) { setElapsed('—'); return; }
        const tick = () => {
            const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
            const h = Math.floor(diff / 3600);
            const m = Math.floor((diff % 3600) / 60);
            const s = diff % 60;
            setElapsed(h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [startedAt, active]);
    return elapsed;
}

// ── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }: {
    label: string; value: string | number; icon: React.ElementType; color: string;
}) {
    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-start gap-3">
            <div className={`p-2.5 rounded-xl ${color}`}>
                <Icon className="h-4 w-4" />
            </div>
            <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">{label}</div>
                <div className="text-xl font-extrabold text-gray-900 dark:text-white">{value}</div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function AdminDriverShow({ driver, bus }: PageProps<{ driver: DriverType; bus: BusInfo | null }>) {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        name: driver.name,
        email: driver.email,
        password: '',
        nid_number: driver.nid_number ?? '',
        phone: driver.phone ?? '',
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(driver.avatar_url);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const elapsed = useLiveTimer(bus?.trip_started_at ?? null, bus?.trip_status === 'on_trip');

    const tripActive = bus?.trip_status === 'on_trip';
    const progressPct = bus && bus.route.total_stops > 0
        ? Math.round((bus.stops_reached_this_trip / bus.route.total_stops) * 100)
        : 0;

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const save = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const data = new FormData();
        data.append('_method', 'PUT');
        data.append('name', form.name);
        data.append('email', form.email);
        if (form.password) data.append('password', form.password);
        data.append('nid_number', form.nid_number);
        data.append('phone', form.phone);
        if (avatarFile) data.append('avatar', avatarFile);

        router.post(driversUpdate.url({ driver: driver.id }), data, {
            forceFormData: true,
            onSuccess: () => setEditing(false),
            onFinish: () => setSaving(false),
        });
    };

    const cancelEdit = () => {
        setEditing(false);
        setForm({ name: driver.name, email: driver.email, password: '', nid_number: driver.nid_number ?? '', phone: driver.phone ?? '' });
        setAvatarPreview(driver.avatar_url);
        setAvatarFile(null);
    };

    return (
        <>
            <Head title={`Driver — ${driver.name}`} />

            <div className="max-w-3xl mx-auto w-full space-y-6">

                {/* Back */}
                <Link href={driversIndex.url()} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="h-4 w-4" /> All Drivers
                </Link>

                {/* ── Profile card ──────────────────────────────────────────── */}
                <div className="rounded-2xl overflow-hidden shadow-lg"
                    style={{ background: 'linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)' }}>
                    <div className="px-6 py-6 flex items-center gap-5">
                        {/* Avatar */}
                        <div className="relative">
                            {avatarPreview ? (
                                <img
                                    src={avatarPreview}
                                    alt={driver.name}
                                    className="h-16 w-16 rounded-2xl object-cover border-2 border-white/20"
                                />
                            ) : (
                                <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center text-white font-extrabold text-2xl">
                                    {driver.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            {tripActive && (
                                <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-gray-900" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="text-xl font-extrabold text-white">{driver.name}</div>
                            <div className="text-indigo-300 text-sm flex items-center gap-1.5 mt-0.5">
                                <Mail className="h-3.5 w-3.5" />{driver.email}
                            </div>
                            {bus && (
                                <div className="text-indigo-300 text-sm flex items-center gap-1.5 mt-1">
                                    <Bus className="h-3.5 w-3.5" />
                                    {bus.name} · {bus.route.name}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <div className={`px-3 py-1.5 rounded-full text-[11px] font-bold border ${
                                tripActive
                                    ? bus?.status === 'running'
                                        ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30'
                                        : 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                                    : 'bg-white/5 text-white/40 border-white/10'
                            }`}>
                                {tripActive ? (bus?.status === 'running' ? '● In Transit' : '● At Stop') : '○ Idle'}
                            </div>
                            {driver.profile_locked && (
                                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 text-white/60 text-[10px] font-semibold">
                                    <Lock className="h-3 w-3" /> Profile Locked
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Progress bar */}
                    {tripActive && bus && (
                        <div className="px-6 pb-5">
                            <div className="flex justify-between text-[10px] text-indigo-300 mb-1.5 uppercase tracking-wider">
                                <span>Trip Progress</span>
                                <span>{bus.stops_reached_this_trip}/{bus.route.total_stops} stops · {progressPct}%</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-indigo-400 to-emerald-400 rounded-full transition-all duration-700"
                                    style={{ width: `${progressPct}%` }} />
                            </div>
                            {bus.current_stop && (
                                <div className="text-indigo-300 text-xs mt-2 flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />Currently at: <span className="text-white font-medium">{bus.current_stop}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Stats ─────────────────────────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard label="Trips Done" value={bus?.trips_completed ?? 0}
                        icon={TrendingUp} color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" />
                    <StatCard label="Trip Duration" value={elapsed}
                        icon={Clock} color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" />
                    <StatCard label="Stops This Trip" value={bus ? `${bus.stops_reached_this_trip}/${bus.route.total_stops}` : '—'}
                        icon={MapPin} color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" />
                    <StatCard label="Bus Status" value={!bus ? 'No Bus' : bus.is_active ? 'Active' : 'Inactive'}
                        icon={Flag} color="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" />
                </div>

                {/* ── Driver Info card ───────────────────────────────────────── */}
                <Card className="dark:bg-gray-900 border-gray-100 dark:border-gray-800">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <User className="h-4 w-4 text-indigo-500" />
                                Driver Information
                            </CardTitle>
                            {!editing ? (
                                <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-1.5">
                                    <Pencil className="h-3.5 w-3.5" /> Edit
                                </Button>
                            ) : (
                                <Button variant="ghost" size="sm" onClick={cancelEdit} className="gap-1.5 text-gray-500">
                                    <X className="h-3.5 w-3.5" /> Cancel
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {!editing ? (
                            /* ── Read-only view ── */
                            <div className="space-y-4">
                                {/* Avatar row */}
                                <div className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-800">
                                    <Camera className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    <div className="flex items-center gap-3">
                                        {driver.avatar_url ? (
                                            <img src={driver.avatar_url} alt={driver.name} className="h-10 w-10 rounded-xl object-cover border border-gray-200 dark:border-gray-700" />
                                        ) : (
                                            <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                                                {driver.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <div className="text-[11px] text-gray-400 uppercase tracking-wider">Avatar</div>
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">{driver.avatar_url ? 'Uploaded' : 'Not set'}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-800">
                                    <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    <div>
                                        <div className="text-[11px] text-gray-400 uppercase tracking-wider">Name</div>
                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{driver.name}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-800">
                                    <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    <div>
                                        <div className="text-[11px] text-gray-400 uppercase tracking-wider">Email</div>
                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{driver.email}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-800">
                                    <CreditCard className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    <div>
                                        <div className="text-[11px] text-gray-400 uppercase tracking-wider">NID Number</div>
                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{driver.nid_number || <span className="text-gray-400 font-normal italic">Not set</span>}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 py-2">
                                    <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    <div>
                                        <div className="text-[11px] text-gray-400 uppercase tracking-wider">Phone</div>
                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{driver.phone || <span className="text-gray-400 font-normal italic">Not set</span>}</div>
                                    </div>
                                </div>

                                {driver.profile_locked && (
                                    <div className="flex items-center gap-2 mt-2 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                                        <Lock className="h-3.5 w-3.5 flex-shrink-0" />
                                        Name, NID and phone are locked — driver cannot edit these fields.
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* ── Edit form ── */
                            <form onSubmit={save} className="space-y-5 max-w-lg" encType="multipart/form-data">

                                {/* Avatar upload */}
                                <div className="space-y-2">
                                    <Label>Profile Photo</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            {avatarPreview ? (
                                                <img src={avatarPreview} alt="Preview" className="h-16 w-16 rounded-2xl object-cover border border-gray-200 dark:border-gray-700" />
                                            ) : (
                                                <div className="h-16 w-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl">
                                                    {driver.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-1.5">
                                                <Camera className="h-3.5 w-3.5" /> Upload Photo
                                            </Button>
                                            <p className="text-xs text-gray-400 mt-1">JPG, PNG or WEBP · max 2MB</p>
                                        </div>
                                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                    </div>
                                </div>

                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">Full Name</Label>
                                    <Input id="edit-name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="edit-email">Email</Label>
                                    <Input id="edit-email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
                                </div>

                                {/* NID */}
                                <div className="space-y-2">
                                    <Label htmlFor="edit-nid" className="flex items-center gap-1.5">
                                        <CreditCard className="h-3.5 w-3.5 text-gray-400" />
                                        NID Number
                                        {driver.profile_locked && <span className="text-xs text-amber-600 font-normal flex items-center gap-1"><Lock className="h-3 w-3" /> Will re-lock on save</span>}
                                    </Label>
                                    <Input id="edit-nid" value={form.nid_number} onChange={e => setForm(p => ({ ...p, nid_number: e.target.value }))} placeholder="e.g. 1234567890123" />
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <Label htmlFor="edit-phone" className="flex items-center gap-1.5">
                                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                                        Phone Number
                                    </Label>
                                    <Input id="edit-phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="e.g. +880 1700 000000" />
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="edit-password" className="flex items-center gap-1.5">
                                        <KeyRound className="h-3.5 w-3.5 text-gray-400" />
                                        New Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span>
                                    </Label>
                                    <Input id="edit-password" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min 8 characters" />
                                </div>

                                {(form.nid_number || form.phone) && (
                                    <div className="flex items-start gap-2 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400">
                                        <Lock className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                                        Saving NID or phone will lock the profile — the driver won't be able to edit their name, NID, or phone afterward.
                                    </div>
                                )}

                                <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                                    <Save className="h-4 w-4" />
                                    {saving ? 'Saving…' : 'Save Changes'}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>

                {/* ── No bus warning ────────────────────────────────────────── */}
                {!bus && (
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-sm text-amber-700 dark:text-amber-400 flex items-start gap-3">
                        <Bus className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <div className="font-semibold">No bus assigned</div>
                            <div className="mt-0.5 text-xs opacity-80">Assign this driver to a bus from the <Link href="/admin/buses" className="underline">Buses page</Link>.</div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

