<?php

namespace App\Http\Controllers\DigModule;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\Implementation\DigModule\DigModuleInitService;
use Exception;

class DigModuleInitController extends Controller
{
    protected DigModuleInitService $ms;

    public function __construct(Request $r)
    {
        if (in_array($r["module"], ['Locus', 'Stone', 'Ceramic'])) {
            $full_class = 'App\Services\Implementation\DigModule\Specific\\' . request()->module . '\\' . request()->module . 'InitService';
            $this->ms = new $full_class(request()->module);
        } else {
            abort(422, 'Illegal module field value: "' . request()->module . '"');
        }
    }

    /**
     * Get the module's init data (counts, trio, description_text)
     */
    public function init(): array
    {
        return  $this->ms->init();
    }
}
