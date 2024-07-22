<?php

namespace App\Http\Controllers\DigModule;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\Implementation\DigModule\DigModuleReadService;

class DigModuleReadController extends Controller
{
    protected DigModuleReadService $ms;

    public function __construct(Request $r)
    {
        if (in_array($r["module"], ['Locus', 'Stone', 'Ceramic'])) {
            $full_class = 'App\Services\Implementation\DigModule\Specific\\' . request()->module . '\\' . request()->module . 'ReadService';
            $this->ms = new $full_class(request()->module);
        } else {
            abort(422, 'Illegal module field value: "' . request()->module . '"');
        }
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
