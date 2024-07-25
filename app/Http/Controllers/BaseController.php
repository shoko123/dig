<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
// use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller;

class BaseController extends Controller
{
    use AuthorizesRequests, ValidatesRequests;

    protected static function makeDigModuleService(string $service_name, string $module)
    {
        if (!in_array($module, ['Locus', 'Stone', 'Ceramic'])) {
            abort(422, '*** Illegal module field value: "' . $module . '"');
        }

        $full_class_name = 'App\Services\Implementation\DigModule\Specific\\' . $module . '\\' . $module;
        switch ($service_name) {
            case 'init_service':
                $full_class_name .= 'InitService';
                break;
            case 'read_service':
                $full_class_name .= 'ReadService';
                break;
            default:
                abort(422, '*** Illegal service value: "' . $service_name . '"');
        }
        return new $full_class_name();
    }
}