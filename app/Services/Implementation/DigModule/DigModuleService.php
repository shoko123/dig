<?php

namespace App\Services\Implementation\DigModule;

use App\Models\DigModule\DigModuleModel;
use App\Services\Implementation\BaseService;

class DigModuleService extends BaseService
{
    protected DigModuleModel $model;

    public function __construct(string $module)
    {
        $this->model = static::makeModel($module);
    }
}
