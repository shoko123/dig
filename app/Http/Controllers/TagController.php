<?php

namespace App\Http\Controllers;

use App\Services\App\TagService;
use App\Http\Requests\Tag\TagSyncRequest;

class TagController extends BaseController
{
    /**
     * Sync item's tags (module and global tags, and also discrete column values).
     */
    public function sync(TagSyncRequest $r)
    {
        $v = $r->validated();
        return response()->json(TagService::sync($v["module"], $v["module_id"], $v["module_tag_ids"], $v["global_tag_ids"], $v["columns"]), 200);
    }
}
