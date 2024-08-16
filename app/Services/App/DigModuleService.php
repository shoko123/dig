<?php

namespace App\Services\App;

use App\Models\DigModule\DigModuleModel;

class DigModuleService extends BaseService
{
    protected DigModuleModel $model;

    public function __construct(string $module)
    {
        $this->model = static::makeModel($module);
    }
}
