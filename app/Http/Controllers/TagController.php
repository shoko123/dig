<?php

namespace App\Http\Controllers;

use App\Http\Requests\Tag\TagSyncRequest;
use App\Services\App\TagService;

class TagController extends BaseController
{
    /**
     * Sync item's tags (module and global tags, and also discrete field values).
     */
    public function sync(TagSyncRequest $r)
    {
        $v = $r->validated();

        return response()->json(TagService::sync($v['module'], $v['module_id'], $v['module_tag_ids'], $v['global_tag_ids'], $v['fields']), 200);
    }
}
