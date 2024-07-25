<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\Implementation\MediaService;

class CarouselController extends BaseController
{
    public function __construct()
    {
        //
    }

    /**
     * Retrieve data needed to show a carousel item. Source may be 'main', or 'media'.
     */
    public function show(Request $r)
    {
        switch ($r["source"]) {
            case 'media':
                return response()->json(MediaService::show_carousel($r["media_id"]), 200);

            case 'main':
            case 'related':
                $rs = static::makeDigModuleService('read_service', $r["module"]);
                return response()->json($rs->show_carousel($r["module"], $r["module_id"]), 200);
        }
    }
}
