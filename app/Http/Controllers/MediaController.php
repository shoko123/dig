<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\Implementation\MediaService;

class MediaController extends BaseController
{
    public function __construct()
    {
        //
    }

    /**
     * Upload an array of media files.
     */
    public function upload(Request $r)
    {
        return response()->json(MediaService::upload($r["module"], $r["id"], $r["media_files"], $r["media_collection_name"]), 200);
    }

    /**
     * Reorder item's related media collection.
     */
    public function reorder(Request $r)
    {
        return response()->json(MediaService::reorder($r["module"], $r["module_id"], $r["ordered_media_ids"]), 200);
    }

    /**
     * Destroy a single media item
     */
    public function destroy(Request $r)
    {
        return response()->json(MediaService::destroy($r["media_id"], $r["module"], $r["module_id"], 200));
    }

    /**
     * Edit the media's name and description.
     */
    public function edit(Request $r)
    {
        return response()->json(MediaService::edit($r->toArray(), 200));
    }
}
