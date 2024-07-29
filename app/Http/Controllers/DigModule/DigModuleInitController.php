<?php

namespace App\Http\Controllers\DigModule;


use Illuminate\Http\Request;
use App\Http\Controllers\BaseController;
use App\Services\App\InitService;

class DigModuleInitController extends BaseController
{
    protected InitService $ms;

    public function __construct(Request $r)
    {
        $this->ms = static::makeDigModuleService('init_service', $r["module"]);
    }

    /**
     * Get the module's init data (counts, trio, description_text)
     */
    public function init()
    {
        return response()->json($this->ms->init(), 200);
    }
}
