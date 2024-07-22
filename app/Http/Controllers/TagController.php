<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

use App\Services\Implementation\TagService;

class TagController extends Controller
{
    protected TagService $service;
    public function __construct(Request $r)
    {
        $this->service = new TagService();
    }
    /**
     * Sync item's tags (model and global tags, and also discrete column values).
     */
    public function sync(Request $r)
    {
        $this->service->sync($r["module"], $r["id"], $r["new_tags"]);
    }
}
