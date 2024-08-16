<?php

namespace App\Http\Controllers;

use App\Models\User;

class AuthController extends BaseController
{
    public function me()
    {
        //dd("ME");
        $user = auth()->user();
        $me = User::findOrFail($user->id);

        return response()->json([
            'name' => $user->name,
            'id' => $user->id,
            'is_verified' => ! ($user->email_verified_at === null),
            'permissions' => $me->getAllPermissions()->pluck('name'),
        ], 200);
    }
}
