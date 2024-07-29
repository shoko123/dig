<?php

namespace App\Http\Controllers\DigModule;

use Illuminate\Http\Request;
use App\Http\Controllers\BaseController;
use App\Services\App\StoreService;

class DigModuleStoreController extends BaseController
{
    protected StoreService $service;

    public function __construct(Request $r)
    {
        $this->service = static::makeDigModuleService('store_service', $r["module"]);
    }
    /**
     * Create/update a DigModule record.
     */
    public function store(Request $r)
    {
        if ($r->isMethod('post')) {
            return response()->json($this->service->create($r->fields), 201);
        } else {
            return response()->json($this->service->update($r->fields), 200);
        }
    }
}
