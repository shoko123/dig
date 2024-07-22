<?php

namespace App\Services\Interfaces;

interface TagServiceInterface
{
    /**
     * Sync model tags, global_tags and lookup values
     */
    public function sync(string $module, string $id, array $new_tags): void;
}
