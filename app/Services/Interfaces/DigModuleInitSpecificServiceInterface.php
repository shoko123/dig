<?php

namespace App\Services\Interfaces;

interface DigModuleInitSpecificServiceInterface
{
    public static function displayOptions(): array;
    public static function welcomeText(): array;
    public static function modelGroups(): array;
    public static function categories(): array;
}
