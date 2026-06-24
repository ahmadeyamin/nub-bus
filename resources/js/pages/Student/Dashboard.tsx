import { Head, Link, usePage } from '@inertiajs/react';
import { login, register, dashboard, tracking } from '@/routes';

// ── Icons ────────────────────────────────────────────────────────────────────

function IconMap() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
    );
}

function IconClock() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}

function IconBell() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    );
}

function IconBarChart() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    );
}

function IconShield() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    );
}

function IconBus() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 6v6" />
            <path d="M15 6v6" />
            <path d="M2 12h19.6" />
            <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
            <circle cx="7" cy="18" r="2" />
            <path d="M9 18h5" />
            <circle cx="16" cy="18" r="2" />
        </svg>
    );
}

function IconArrowRight() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    );
}

// ── Stop row in the bus card ──────────────────────────────────────────────────

interface StopRowProps {
    color: string;
    name: string;
    time: string;
    isYourStop?: boolean;
}

function StopRow({ color, name, time, isYourStop }: StopRowProps) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: isYourStop ? '#1a1a1a' : '#555', fontWeight: isYourStop ? 600 : 400 }}>
                    {name}
                    {isYourStop && <span style={{ fontSize: 11, color: '#888', fontWeight: 400 }}> — your stop</span>}
                </span>
            </div>
            <span style={{ fontSize: 13, color: '#555', fontWeight: 500 }}>{time}</span>
        </div>
    );
}

// ── Feature card ─────────────────────────────────────────────────────────────

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
    return (
        <div style={{
            background: '#fff',
            border: '1px solid #e8e8e4',
            borderRadius: 12,
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
        }}>
            <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: '#f0f4ef',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2d6a2d',
            }}>
                {icon}
            </div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a1a' }}>{title}</div>
            <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{description}</div>
        </div>
    );
}

// ── Role card ────────────────────────────────────────────────────────────────

interface RoleCardProps {
    title: string;
    description: string;
    portalHref: string;
}

function RoleCard({ title, description, portalHref }: RoleCardProps) {
    return (
        <div style={{
            background: '#fff',
            border: '1px solid #e8e8e4',
            borderRadius: 12,
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
        }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>FOR</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>{title}</div>
            <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6, flex: 1 }}>{description}</div>
            <Link
                href={portalHref}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#2d6a2d',
                    textDecoration: 'none',
                    marginTop: 8,
                }}
            >
                Open portal <IconArrowRight />
            </Link>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function StudentDashboard() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="NUB Transit – Never miss the campus bus again" />

            <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#f8f7f3', minHeight: '100vh', color: '#1a1a1a' }}>

                {/* ── Navbar ── */}
                <nav style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                    background: '#f8f7f3',
                    borderBottom: '1px solid #e8e8e4',
                }}>
                    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {/* Logo */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                background: '#2d6a2d',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontWeight: 800,
                                fontSize: 14,
                                letterSpacing: '-0.5px',
                            }}>N</div>
                            <span style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>NUB Transit</span>
                        </div>

                        {/* Nav links */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                            <a href="#features" style={{ fontSize: 14, color: '#555', textDecoration: 'none', fontWeight: 500 }}>Features</a>
                            <a href="#how-it-works" style={{ fontSize: 14, color: '#555', textDecoration: 'none', fontWeight: 500 }}>How it works</a>
                        </div>

                        {/* Auth buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {auth?.user ? (
                                <Link
                                    href={dashboard.url()}
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: '#fff',
                                        background: '#2d6a2d',
                                        textDecoration: 'none',
                                        padding: '7px 16px',
                                        borderRadius: 8,
                                    }}
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login.url()}
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 500,
                                            color: '#1a1a1a',
                                            textDecoration: 'none',
                                            padding: '7px 14px',
                                        }}
                                    >
                                        Sign in
                                    </Link>
                                    <Link
                                        href={register.url()}
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 600,
                                            color: '#fff',
                                            background: '#2d6a2d',
                                            textDecoration: 'none',
                                            padding: '7px 16px',
                                            borderRadius: 8,
                                        }}
                                    >
                                        Sign up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* ── Hero ── */}
                <section style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 24px 64px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 48, flexWrap: 'wrap' }}>

                        {/* Left copy */}
                        <div style={{ flex: '1 1 380px', maxWidth: 520 }}>
                            {/* Live badge */}
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                background: '#fef3c7',
                                border: '1px solid #fde68a',
                                borderRadius: 999,
                                padding: '4px 12px',
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#92400e',
                                marginBottom: 20,
                            }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                                Live tracking online
                            </div>

                            <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, lineHeight: 1.15, margin: '0 0 16px', color: '#1a1a1a' }}>
                                Never miss the<br />
                                <span style={{ color: '#2d6a2d' }}>campus bus</span> again.
                            </h1>

                            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7, margin: '0 0 32px', maxWidth: 420 }}>
                                NUB Transit gives the whole university — students, drivers and administrators — a single live view of the bus fleet, with smart ETAs and instant alerts.
                            </p>

                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                <Link
                                    href={auth?.user ? dashboard.url() : login.url()}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        background: '#2d6a2d',
                                        color: '#fff',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                        fontSize: 14,
                                        padding: '10px 22px',
                                        borderRadius: 8,
                                    }}
                                >
                                    Open dashboard
                                </Link>
                                <a
                                    href="#features"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        background: 'transparent',
                                        color: '#1a1a1a',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                        fontSize: 14,
                                        padding: '10px 22px',
                                        borderRadius: 8,
                                        border: '1px solid #d1d5db',
                                    }}
                                >
                                    See features
                                </a>
                            </div>
                        </div>

                        {/* Right — bus card */}
                        <div style={{ flex: '1 1 300px', maxWidth: 380 }}>
                            <div style={{
                                background: '#fff',
                                border: '1px solid #e8e8e4',
                                borderRadius: 16,
                                padding: '24px',
                                boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
                            }}>
                                <div style={{ fontSize: 11, color: '#888', fontWeight: 500, marginBottom: 4 }}>Next bus to your stop</div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                                    <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a' }}>NUB-01 · 4 min</div>
                                    <span style={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: '#2d6a2d',
                                        background: '#e6f4e6',
                                        padding: '3px 10px',
                                        borderRadius: 999,
                                        letterSpacing: '0.05em',
                                    }}>ON TIME</span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <StopRow color="#2d6a2d" name="Uttara Sector 7" time="08:00" />
                                    <StopRow color="#2d6a2d" name="Airport Road" time="08:12" />
                                    <StopRow color="#f59e0b" name="Khilkhet" time="08:24" isYourStop />
                                    <StopRow color="#ccc" name="Kuril Flyover" time="08:36" />
                                    <StopRow color="#ccc" name="NUB Campus" time="08:50" />
                                </div>

                                {/* Live tracking link */}
                                <Link
                                    href={tracking.url()}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 6,
                                        marginTop: 18,
                                        padding: '9px',
                                        background: '#f0f4ef',
                                        borderRadius: 8,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: '#2d6a2d',
                                        textDecoration: 'none',
                                        border: '1px solid #d4e8d4',
                                    }}
                                >
                                    <IconMap />
                                    View Live Tracking Map
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Everything the campus needs ── */}
                <section id="features" style={{ background: '#f0ede7', padding: '64px 24px' }}>
                    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a', margin: '0 0 6px' }}>Everything the campus needs</h2>
                        <p style={{ fontSize: 14, color: '#777', margin: '0 0 40px' }}>One platform covering every requirement in the SRS.</p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                            <FeatureCard
                                icon={<IconMap />}
                                title="Live tracking"
                                description="Watch every bus move in real time on an interactive campus map."
                            />
                            <FeatureCard
                                icon={<IconClock />}
                                title="Smart ETAs"
                                description="Know exactly when your bus will reach your stop — no more guessing."
                            />
                            <FeatureCard
                                icon={<IconBell />}
                                title="Delay & arrival alerts"
                                description="Get notified the moment something changes on your route."
                            />
                            <FeatureCard
                                icon={<IconBarChart />}
                                title="Usage analytics"
                                description="Admins see ridership, trips, and route health at a glance."
                            />
                            <FeatureCard
                                icon={<IconShield />}
                                title="Role-based access"
                                description="Separate, secure portals for students, drivers, and admins."
                            />
                            <FeatureCard
                                icon={<IconBus />}
                                title="Fleet management"
                                description="Add, edit, and assign buses, drivers, routes, and stops."
                            />
                        </div>
                    </div>
                </section>

                {/* ── Built for three roles ── */}
                <section id="how-it-works" style={{ background: '#f8f7f3', padding: '64px 24px' }}>
                    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a', margin: '0 0 40px' }}>Built for three roles</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                            <RoleCard
                                title="Students"
                                description="View live buses, ETA to your stop, route maps and personalized alerts."
                                portalHref={login.url()}
                            />
                            <RoleCard
                                title="Drivers"
                                description="Start a trip, share GPS automatically, mark delays and arrivals."
                                portalHref={login.url()}
                            />
                            <RoleCard
                                title="Admins"
                                description="Manage fleet, routes, users and analyze ridership trends."
                                portalHref={login.url()}
                            />
                        </div>
                    </div>
                </section>

                {/* ── Footer ── */}
                <footer style={{ borderTop: '1px solid #e8e8e4', background: '#f8f7f3', padding: '20px 24px' }}>
                    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                        <span style={{ fontSize: 13, color: '#999' }}>© 2026 Northern University Bangladesh</span>
                        <span style={{ fontSize: 13, color: '#999' }}>NUB Transit · v1.0</span>
                    </div>
                </footer>
            </div>
        </>
    );
}
