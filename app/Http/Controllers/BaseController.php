<?php

namespace App\Http\Controllers;

use App\Services\App\MutateService;
// use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller;

class BaseController extends Controller
{
    use AuthorizesRequests, ValidatesRequests;

    protected static function makeDigModuleService(ServiceEnum $service, string $module)
    {
        if (! in_array($module, ['Locus', 'Stone', 'Ceramic'])) {
            abort(422, '*** Illegal module field value: "'.$module.'"');
        }

        $full_class_name = 'App\Services\App\ModuleSpecific\\'.$module.'\\'.$module;
        switch ($service) {
            case ServiceEnum::Init:
                $full_class_name .= 'InitService';
                break;
            case ServiceEnum::Read:
                $full_class_name .= 'ReadService';
                break;
            case ServiceEnum::Mutate:
                return new MutateService($module);

            default:
                abort(422, '*** Illegal service value');
        }

        return new $full_class_name();
    }
}
