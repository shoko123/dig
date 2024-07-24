<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\Implementation\MediaService;

class MediaController extends Controller
{
    protected MediaService $ms;

    public function __construct()
    {
        $this->ms = new MediaService();
    }

    /**
     * Upload an array of media files.
     */
    public function upload(Request $r)
    {
        return response()->json($this->ms->upload($r->toArray(), 200));
    }


    /**
     * Reorder item's related media collection.
     */
    public function reorder(Request $r)
    {
        return response()->json($this->ms->reorder($r->toArray(), 200));
    }

    /**
     * Destroy a single media item
     */
    public function destroy(Request $r)
    {
        return response()->json($this->ms->destroy($r->toArray(), 200));
        //
    }

    /**
     * Edit the media's name and description.
     */
    public function edit(Request $r)
    {
        return response()->json($this->ms->edit($r->toArray(), 200));
    }
}
