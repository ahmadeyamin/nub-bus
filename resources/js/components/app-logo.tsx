import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600">
                <AppLogoIcon className="size-5 fill-current text-white" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-bold text-gray-900 dark:text-white">
                    NUB Bus
                </span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                    Tracking System
                </span>
            </div>
        </>
    );
}
