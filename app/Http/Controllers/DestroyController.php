<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Services\Implementation\DestroyService;

class DestroyController extends BaseController
{
    /**
     * Destroy an item by module & id.
     */
    public function destroy(Request $r)
    {
        return response()->json(DestroyService::destroy($r["module"], $r["id"]), 200);
    }
}
