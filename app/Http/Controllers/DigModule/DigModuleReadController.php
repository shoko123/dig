<?php

namespace App\Http\Controllers\DigModule;

use Illuminate\Http\Request;
use App\Http\Controllers\BaseController;
use App\Services\Implementation\DigModule\DigModuleReadService;

class DigModuleReadController extends BaseController
{
    protected DigModuleReadService $ms;

    public function __construct(Request $r)
    {
        $this->ms = static::makeDigModuleService('read_service', $r["module"]);
    }

    /**
     * Filter the module's table and return an array of ids.
     */
    public function index(Request $r)
    {
        return $this->ms->index($r["query"]);
    }

    /**
     * Retrieve a sub-collection (page) of records of ids sent, formated according to the page's type (Tabular, Media)
     */
    public function page(Request $r)
    {
        return $this->ms->page($r["ids"], $r["view"]);
    }

    /**
     * Retrieve a single record and related data.
     */
    public function show(Request $r)
    {
        return $this->ms->show($r["id"]);
    }
}
