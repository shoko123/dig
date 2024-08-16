<?php

namespace App\Services\App;

class BaseService
{
    protected static function makeModel(string $module)
    {
        $full_class = 'App\Models\DigModule\Specific\\'.$module.'\\'.$module;

        return new $full_class;
    }
}
