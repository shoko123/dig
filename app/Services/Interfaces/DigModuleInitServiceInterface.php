<?php

namespace App\Services\Interfaces;

interface DigModuleInitServiceInterface
{
    /**
     * Retrieve data to init a specific DigModule.
     */
    public function init(): array;
}
