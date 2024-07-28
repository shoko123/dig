<?php

namespace App\Http\Controllers\DigModule;


use Illuminate\Http\Request;
use App\Http\Controllers\BaseController;
use App\Services\Implementation\DigModule\DigModuleInitService;

class DigModuleInitController extends BaseController
{
    protected DigModuleInitService $ms;

    public function __construct(Request $r)
    {
        $this->ms = static::makeDigModuleService('init_service', $r["module"]);
    }

    /**
     * Get the module's init data (counts, trio, description_text)
     */
    public function init(): array
    {
        return $this->ms->init();
    }
}
