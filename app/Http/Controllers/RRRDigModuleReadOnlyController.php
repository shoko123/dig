<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;
use App\Http\Controllers\BaseController;
use App\Services\App\InitService;

use App\Http\Controllers\ServicesEnum;

class DigModuleReadOnlyController extends BaseController
{
    /**
     * Get the module's init data (counts, trio, description_text)
     */
    public function init(Request $r)
    {
        $initService = static::makeDigModuleService(ServicesEnum::Init, $r["module"]);
        return response()->json($initService->init(), 200);
    }

    /**
     * Filter the module's table and return an array of ids.
     */
    public function index(Request $r)
    {
        $readService = static::makeDigModuleService(ServicesEnum::Read, $r["module"]);
        return response()->json($readService->index($r["query"]), 200);
    }

    /**
     * Retrieve a sub-collection (page) of records of ids sent, formated according to the page's type (Tabular, Media)
     */
    public function page(Request $r)
    {
        $readService = static::makeDigModuleService(ServicesEnum::Read, $r["module"]);
        return response()->json($readService->page($r["ids"], $r["view"]), 200);
    }

    /**
     * Retrieve a single record and related data.
     */
    public function show(Request $r)
    {
        $readService = static::makeDigModuleService(ServicesEnum::Read, $r["module"]);
        return response()->json($readService->show($r["id"]), 200);
    }
}
