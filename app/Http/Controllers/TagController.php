<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Services\App\TagService;

class TagController extends BaseController
{
    /**
     * Sync item's tags (model and global tags, and also discrete column values).
     */
    public function sync(Request $r)
    {
        return response()->json(TagService::sync($r["module"], $r["id"], $r["module_tag_ids"], $r["global_tag_ids"], $r["columns"]), 200);
    }
}
