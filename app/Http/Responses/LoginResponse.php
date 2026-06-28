<?php

namespace App\Http\Responses;

use App\Models\User;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    /**
     * Flash a login alert with role info then redirect to the dashboard.
     */
    public function toResponse($request): mixed
    {
        /** @var User $user */
        $user = $request->user();

        $roleMessages = [
            'admin' => 'You are logged in as an Administrator. Manage routes, buses, and drivers from the quick links below.',
            'driver' => 'You are logged in as a Driver. Head to your Driver Panel to start or continue a trip.',
            'student' => 'You are logged in as a Student. Track your bus in real-time from the Live Tracking page.',
        ];

        $request->session()->flash('login_alert', [
            'role' => $user->role ?? 'student',
            'message' => $roleMessages[$user->role ?? 'student'] ?? $roleMessages['student'],
        ]);

        return redirect()->intended(config('fortify.home', '/dashboard'));
    }
}
