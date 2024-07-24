<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\Implementation\MediaService;

class CarouselController extends Controller
{
    protected MediaService $ms;

    public function __construct()
    {
        //$this->ms = new MediaService();
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
                $full_class = 'App\Services\Implementation\DigModule\Specific\\' . request()->module . '\\' . request()->module . 'ReadService';
                $rs = new $full_class(request()->module);
                return response()->json($rs->show_carousel($r["module"], $r["module_id"]), 200);
        }
    }
}
