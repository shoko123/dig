<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Services\Implementation\TagService;

class TagController extends BaseController
{
    public function __construct(Request $r)
    {
        //
    }
    /**
     * Sync item's tags (model and global tags, and also discrete column values).
     */
    public function sync(Request $r)
    {

        TagService::sync($r["module"], $r["id"], $r["module_tag_ids"], $r["global_tag_ids"], $r["columns"]);
    }
}
