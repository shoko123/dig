<?php

namespace App\Http\Controllers;

use App\Http\Controllers\BaseController;
use App\Http\Controllers\ServiceEnum;
use App\Http\Requests\Module\ModuleRequest;
use App\Http\Requests\Module\PageRequest;
use App\Http\Requests\Module\IndexRequest;
use App\Http\Requests\Module\StoreRequest;
use App\Http\Requests\Module\ItemByIdRequest;

class DigModuleController extends BaseController
{
    /**
     * Get the module's init data (counts, trio, description_text)
     */
    public function init(ModuleRequest $r)
    {
        $v = $r->validated();
        $initService = static::makeDigModuleService(ServiceEnum::Init, $v["module"]);
        return response()->json($initService->init(), 200);
    }

    /**
     * Filter the module's table and return an array of ids.
     */
    public function index(IndexRequest $r)
    {
        $v = $r->validated();
        $readService = static::makeDigModuleService(ServiceEnum::Read, $v["module"]);
        return response()->json($readService->index($v["query"] ?? null), 200);
    }

    /**
     * Retrieve a sub-collection (page) of records of ids sent, formated according to the page's type (Tabular, Media)
     */
    public function page(PageRequest $r)
    {
        $v = $r->validated();
        $readService = static::makeDigModuleService(ServiceEnum::Read, $r["module"]);
        return response()->json($readService->page($v["ids"], $v["view"]), 200);
    }

    /**
     * Retrieve a single record and related data.
     */
    public function show(ItemByIdRequest $r)
    {
        $v = $r->validated();
        $readService = static::makeDigModuleService(ServiceEnum::Read, $v["module"]);
        return response()->json($readService->show($v["id"]), 200);
    }

    /**
     * Create/update a DigModule record.
     */
    public function store(StoreRequest $r)
    {
        $v = $r->validated();
        $mutateService = static::makeDigModuleService(ServiceEnum::Mutate, $v["module"]);
        if ($r->isMethod('post')) {
            return response()->json($mutateService->create($v["fields"]), 201);
        } else {
            return response()->json($mutateService->update($v["fields"]), 200);
        }
    }

    public function destroy(ItemByIdRequest $r)
    {
        $v = $r->validated();
        $mutateService = static::makeDigModuleService(ServiceEnum::Mutate, $r["module"]);
        return response()->json($mutateService->destroy($v["module"], $v["id"]), 200);
    }
}
