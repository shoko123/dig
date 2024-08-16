<?php

namespace App\Http\Controllers;

use App\Http\Requests\Media\MediaDestroyRequest;
use App\Http\Requests\Media\MediaReorderRequest;
use App\Http\Requests\Media\MediaUploadRequest;
use App\Services\App\MediaService;
use Illuminate\Http\Request;

class MediaController extends BaseController
{
    /**
     * Upload an array of media files.
     */
    public function upload(MediaUploadRequest $r)
    {
        $v = $r->validated();

        return response()->json(MediaService::upload($v['module'], $v['id'], $v['media_files'], $v['media_collection_name']), 200);
    }

    /**
     * Reorder item's related media collection.
     */
    public function reorder(MediaReorderRequest $r)
    {
        $v = $r->validated();

        return response()->json(MediaService::reorder($v['module'], $v['module_id'], $v['ordered_media_ids']), 200);
    }

    /**
     * Destroy a single media item
     */
    public function destroy(MediaDestroyRequest $r)
    {
        $v = $r->validated();

        return response()->json(MediaService::destroy($v['media_id'], $v['module'], $v['module_id'], 200));
    }

    /**
     * Edit the media's name and description.
     */
    public function edit(Request $r)
    {
        response()->json(MediaService::edit($r->toArray(), 200));
    }
}
