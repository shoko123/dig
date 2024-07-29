<?php

namespace App\Services\App\ModuleSpecific;

interface InitSpecificServiceInterface
{
    public static function displayOptions(): array;
    public static function welcomeText(): array;
    public static function modelGroups(): array;
    public static function categories(): array;
    public static function dateColumns(): array;
}
