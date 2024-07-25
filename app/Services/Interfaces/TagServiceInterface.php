<?php

namespace App\Services\Interfaces;

interface TagServiceInterface
{
    /**
     * Sync model tags, global_tags and lookup values
     */
    public static function sync(string $module, string $id, array $module_tag_ids, array $global_tag_ids, array $columns): void;
}
