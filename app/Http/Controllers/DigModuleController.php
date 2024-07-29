<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\BaseController;
use App\Http\Controllers\ServiceEnum;

class DigModuleController extends BaseController
{
    /**
     * Get the module's init data (counts, trio, description_text)
     */
    public function init(Request $r)
    {
        $initService = static::makeDigModuleService(ServiceEnum::Init, $r["module"]);
        return response()->json($initService->init(), 200);
    }

    /**
     * Filter the module's table and return an array of ids.
     */
    public function index(Request $r)
    {
        $readService = static::makeDigModuleService(ServiceEnum::Read, $r["module"]);
        return response()->json($readService->index($r["query"]), 200);
    }

    /**
     * Retrieve a sub-collection (page) of records of ids sent, formated according to the page's type (Tabular, Media)
     */
    public function page(Request $r)
    {
        $readService = static::makeDigModuleService(ServiceEnum::Read, $r["module"]);
        return response()->json($readService->page($r["ids"], $r["view"]), 200);
    }

    /**
     * Retrieve a single record and related data.
     */
    public function show(Request $r)
    {
        $readService = static::makeDigModuleService(ServiceEnum::Read, $r["module"]);
        return response()->json($readService->show($r["id"]), 200);
    }
    /**
     * Create/update a DigModule record.
     */
    public function store(Request $r)
    {
        $mutateService = static::makeDigModuleService(ServiceEnum::Mutate, $r["module"]);
        if ($r->isMethod('post')) {
            return response()->json($mutateService->create($r->fields), 201);
        } else {
            return response()->json($mutateService->update($r->fields), 200);
        }
    }

    public function destroy(Request $r)
    {
        $mutateService = static::makeDigModuleService(ServiceEnum::Mutate, $r["module"]);
        return response()->json($mutateService->destroy($r["module"], $r["id"]), 200);
    }
}
