<?php

namespace App\Http\Requests\Module\ModuleSpecific;

abstract class StoreRules
{
    abstract protected static function create_rules(): array;
    abstract protected static function update_rules(): array;

    public static function rules(bool $isCreate): array
    {
        return $isCreate ? static::create_rules() : static::update_rules();
    }
}
